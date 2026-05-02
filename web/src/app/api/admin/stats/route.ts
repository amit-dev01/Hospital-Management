import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/stats
 * Returns aggregated hospital-wide stats for the admin dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Run all queries in parallel
    const [
      patientsToday,
      doctorsTotal,
      doctorsVerified,
      pendingVerification,
      tokensToday,
      appointmentsToday,
    ] = await Promise.all([
      // Unique patients with appointments today
      supabase
        .from('appointments')
        .select('patient_id', { count: 'exact', head: true })
        .eq('date', today)
        .not('status', 'eq', 'cancelled'),

      // Total doctors
      supabase
        .from('doctors')
        .select('id', { count: 'exact', head: true }),

      // Verified doctors
      supabase
        .from('doctors')
        .select('id', { count: 'exact', head: true })
        .eq('is_verified', true),

      // Pending verification
      supabase
        .from('doctors')
        .select('id', { count: 'exact', head: true })
        .eq('is_verified', false),

      // Tokens today (waiting + in-progress = active queue)
      supabase
        .from('tokens')
        .select('status', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`),

      // Appointments today by status
      supabase
        .from('appointments')
        .select('status')
        .eq('date', today),
    ]);

    const apptData = (appointmentsToday.data ?? []) as { status: string }[];
    const tokenData = (tokensToday.data ?? []) as { status: string }[];

    const stats = {
      patientsToday: patientsToday.count ?? 0,
      doctorsAvailable: doctorsVerified.count ?? 0,
      doctorsTotal: doctorsTotal.count ?? 0,
      pendingVerification: pendingVerification.count ?? 0,
      activeQueue: tokenData.filter((t) => ['waiting', 'in-progress'].includes(t.status)).length,
      completedToday: apptData.filter((a) => a.status === 'completed').length,
      cancelledToday: apptData.filter((a) => a.status === 'cancelled').length,
      appointmentsToday: apptData.length,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
