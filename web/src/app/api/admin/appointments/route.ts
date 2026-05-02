import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Fetch appointments for today
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        time_slot,
        status,
        priority,
        is_emergency,
        patient:profiles!patient_id ( full_name, phone ),
        doctor:profiles!doctor_id ( full_name ),
        doctor_details:doctors!doctor_id ( specialization )
      `)
      .eq('date', today)
      .order('time_slot', { ascending: true });

    if (apptError) throw apptError;

    // Fetch today's tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('v_today_active_queue')
      .select('*');

    if (tokensError) throw tokensError;

    return NextResponse.json({ appointments, tokens }, { status: 200 });

  } catch (err: any) {
    console.error('Failed to fetch admin appointments:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
