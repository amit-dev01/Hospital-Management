import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateQueueWithWaitTimes } from '@/lib/queue/tokenHelpers';

/**
 * GET /api/appointments/patient/:patientId
 * Returns all appointments for a patient with token + queue position + wait time.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  try {
    const supabase = await createClient();
    const { patientId } = await params;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    // ── Fetch all appointments for patient ────────────────────────────────────
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        tokens (
          id,
          token_number,
          priority,
          status,
          created_at,
          started_at
        )
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('time_slot', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── For today's active appointments, compute queue position + wait time ───
    const today = new Date().toISOString().split('T')[0];
    const { searchParams } = new URL(request.url);
    const avgTimeStr = searchParams.get('avgTime');
    const avgTime = avgTimeStr ? parseInt(avgTimeStr, 10) : 10;

    const enriched = await Promise.all(
      (appointments ?? []).map(async (appt: any) => {
        let queuePosition: number | null = null;
        let estimatedWaitTime: number | null = null;

        // Only calculate live position for today's active (non-cancelled/completed) appointments
        if (appt.date === today && appt.status !== 'cancelled' && appt.status !== 'completed') {
          const queue = await calculateQueueWithWaitTimes(supabase, appt.doctor_id, avgTime);
          const idx = queue.findIndex((t: any) => t.appointment_id === appt.id);
          if (idx !== -1) {
            queuePosition = idx + 1;
            estimatedWaitTime = queue[idx].estimatedWaitTime;
          }
        }

        return {
          ...appt,
          queuePosition,
          estimatedWaitTime,
        };
      }),
    );

    return NextResponse.json({ patientId, appointments: enriched }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
