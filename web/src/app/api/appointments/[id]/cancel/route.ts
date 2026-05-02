import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/appointments/:id/cancel
 * Patient or doctor cancels an appointment. Frees the time slot and recalculates queue.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const cancelledBy: string = body.cancelledBy ?? 'unknown'; // 'patient' | 'doctor'
    const reason: string = body.reason ?? null;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    // ── Fetch current appointment ─────────────────────────────────────────────
    const { data: appt, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status, doctor_id, date')
      .eq('id', id)
      .single();

    if (fetchError || !appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appt.status === 'cancelled') {
      return NextResponse.json({ error: 'Appointment is already cancelled' }, { status: 409 });
    }

    if (appt.status === 'completed') {
      return NextResponse.json({ error: 'Cannot cancel a completed appointment' }, { status: 409 });
    }

    // ── Cancel the appointment ────────────────────────────────────────────────
    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelled by ${cancelledBy}: ${reason}` : `Cancelled by ${cancelledBy}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // ── Cancel the associated token (frees queue slot) ────────────────────────
    const { error: tokenError } = await supabase
      .from('tokens')
      .update({ status: 'cancelled' })
      .eq('appointment_id', id)
      .in('status', ['waiting', 'in-progress']); // don't touch already-done tokens

    if (tokenError) {
      console.error('Token cancel error:', tokenError.message);
    }

    // ── Return updated queue (remaining patients after cancellation) ───────────
    const { data: remainingQueue } = await supabase
      .from('tokens')
      .select('id, token_number, priority, status, created_at')
      .eq('doctor_id', appt.doctor_id)
      .gte('created_at', `${appt.date}T00:00:00.000Z`)
      .lte('created_at', `${appt.date}T23:59:59.999Z`)
      .in('status', ['waiting', 'in-progress'])
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      appointment: updated,
      remainingQueueSize: (remainingQueue ?? []).length,
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
