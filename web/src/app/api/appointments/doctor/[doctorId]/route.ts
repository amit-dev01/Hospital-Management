import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/appointments/doctor/:doctorId?date=YYYY-MM-DD
 * Returns today's (or specified date's) appointment list sorted by priority → time slot.
 * Includes patient details and priority flags.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> },
) {
  try {
    const supabase = await createClient();
    const { doctorId } = await params;
    const { searchParams } = new URL(request.url);

    const today = new Date().toISOString().split('T')[0];
    const date = searchParams.get('date') ?? today;

    if (!doctorId) {
      return NextResponse.json({ error: 'doctorId is required' }, { status: 400 });
    }

    // ── Fetch appointments for this doctor on this date ───────────────────────
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles:patient_id (
          full_name,
          phone
        ),
        patients:patient_id (
          age,
          gender,
          blood_group
        ),
        tokens (
          id,
          token_number,
          status,
          started_at
        )
      `)
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .not('status', 'eq', 'cancelled')
      .order('priority', { ascending: true })      // Emergency → Pregnant → Senior → Regular
      .order('time_slot', { ascending: true });     // FIFO within same priority

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Fetch doctor's avg consultation time ──────────────────────────────────
    const { data: settings } = await supabase
      .from('doctor_queue_settings')
      .select('avg_consultation_min')
      .eq('doctor_id', doctorId)
      .maybeSingle();

    const avgTime = settings?.avg_consultation_min ?? 10;

    // ── Add estimated wait time per patient ───────────────────────────────────
    let waitingPatientsSeen = 0;
    let currentPatientRemainingTime = 0;

    // Determine remaining time for in-progress patient
    const inProgress = (appointments ?? []).find(
      (a: any) => a.tokens?.[0]?.status === 'in-progress',
    );
    if (inProgress?.tokens?.[0]?.started_at) {
      const elapsedMs = Date.now() - new Date(inProgress.tokens[0].started_at).getTime();
      currentPatientRemainingTime = Math.max(0, avgTime - elapsedMs / 60000);
    }

    const enriched = (appointments ?? []).map((appt: any, index: number) => {
      const tokenStatus = appt.tokens?.[0]?.status ?? 'waiting';
      let estimatedWaitTime: number | null = null;

      if (tokenStatus === 'in-progress') {
        estimatedWaitTime = 0;
      } else if (tokenStatus === 'waiting') {
        estimatedWaitTime = Math.round(
          waitingPatientsSeen * avgTime + currentPatientRemainingTime,
        );
        waitingPatientsSeen++;
      }

      return {
        ...appt,
        queuePosition: index + 1,
        estimatedWaitTime,
        priorityLabel:
          appt.priority === 1 ? 'Emergency' :
          appt.priority === 2 ? 'Pregnant' :
          appt.priority === 3 ? 'Senior Citizen' : 'Regular',
        patientName: appt.profiles?.full_name ?? 'Unknown',
        patientPhone: appt.profiles?.phone ?? null,
        patientAge: appt.patients?.age ?? null,
        patientGender: appt.patients?.gender ?? null,
        patientBloodGroup: appt.patients?.blood_group ?? null,
        tokenNumber: appt.tokens?.[0]?.token_number ?? null,
        tokenStatus,
      };
    });

    // ── Summary stats ─────────────────────────────────────────────────────────
    const summary = {
      total: enriched.length,
      waiting: enriched.filter((a: any) => a.tokenStatus === 'waiting').length,
      inProgress: enriched.filter((a: any) => a.tokenStatus === 'in-progress').length,
      completed: enriched.filter((a: any) => a.status === 'completed').length,
      emergencies: enriched.filter((a: any) => a.priority === 1).length,
    };

    return NextResponse.json({ doctorId, date, summary, appointments: enriched }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
