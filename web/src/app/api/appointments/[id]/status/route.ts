import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateStatusTransition } from '@/lib/appointments/validators';

/**
 * PATCH /api/appointments/:id/status
 * Doctor updates appointment: confirmed → in-progress → completed
 * Syncs the associated token status too.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();
    const { status: nextStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!nextStatus || !validStatuses.includes(nextStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 },
      );
    }

    // ── Fetch current appointment ─────────────────────────────────────────────
    const { data: appt, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, doctor_id, patient_id')
      .eq('id', id)
      .single();

    if (fetchError || !appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // ── Validate transition ───────────────────────────────────────────────────
    const { valid, message } = validateStatusTransition(appt.status, nextStatus);
    if (!valid) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    // ── Update appointment ────────────────────────────────────────────────────
    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // ── Map appointment status → token status ─────────────────────────────────
    const TOKEN_STATUS_MAP: Record<string, string> = {
      'in-progress': 'in-progress',
      'completed':   'done',
      'cancelled':   'cancelled',
    };
    const newTokenStatus = TOKEN_STATUS_MAP[nextStatus];

    if (newTokenStatus) {
      const tokenUpdate: any = { status: newTokenStatus };

      // Record started_at when doctor calls patient in
      if (newTokenStatus === 'in-progress') {
        tokenUpdate.started_at = new Date().toISOString();
      }

      const { error: tokenError } = await supabase
        .from('tokens')
        .update(tokenUpdate)
        .eq('appointment_id', id);

      if (tokenError) {
        console.error('Token sync error:', tokenError.message);
      }
    }

    // ── Fetch updated queue for real-time broadcast context ───────────────────
    const today = new Date().toISOString().split('T')[0];
    const { data: nextInQueue } = await supabase
      .from('tokens')
      .select('appointment_id, token_number, priority')
      .eq('doctor_id', appt.doctor_id)
      .eq('status', 'waiting')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      message: `Appointment status updated to "${nextStatus}"`,
      appointment: updated,
      nextPatient: nextInQueue ?? null,
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
