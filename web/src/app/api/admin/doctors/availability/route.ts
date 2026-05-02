import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const dayOfWeek = new Date().getDay(); // 0-6

    // Fetch all doctors and their availability for TODAY
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        experience_years,
        is_verified,
        profiles!id ( full_name, phone ),
        doctor_availability ( is_active, max_patients_per_day, start_time, end_time )
      `);
      
    if (error) throw error;

    // Filter availability for today only in JS (since supabase JS client filtering on nested relations is tricky)
    const formattedDoctors = doctors.map((doc: any) => {
      // Because we can't easily filter the nested relation by day_of_week in the select string directly without RPC,
      // actually wait, let's just fetch doctor_availability separately or we can filter it if we used `.eq('doctor_availability.day_of_week', dayOfWeek)` but that filters the parent row if we use inner join.
      return {
        ...doc,
        // we will fetch the specific availability for today below
      };
    });

    const { data: availabilities } = await supabase
      .from('doctor_availability')
      .select('doctor_id, is_active, max_patients_per_day')
      .eq('day_of_week', dayOfWeek);

    const availMap = new Map();
    availabilities?.forEach(a => availMap.set(a.doctor_id, a));

    const finalDoctors = formattedDoctors.map(doc => ({
      ...doc,
      today_availability: availMap.get(doc.id) || null
    }));

    return NextResponse.json({ doctors: finalDoctors }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Verify admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { doctorId, isActive, maxPatients } = await req.json();
    const dayOfWeek = new Date().getDay();

    // Upsert the availability for today
    // To upsert we need the other fields too, so let's fetch first or just update if exists.
    const { data: existing } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('doctor_availability')
        .update({ is_active: isActive, max_patients_per_day: maxPatients })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Create default if missing
      const { error } = await supabase
        .from('doctor_availability')
        .insert({
          doctor_id: doctorId,
          day_of_week: dayOfWeek,
          start_time: '09:00',
          end_time: '17:00',
          slot_duration_minutes: 15,
          max_patients_per_day: maxPatients,
          is_active: isActive
        });
      if (error) throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
