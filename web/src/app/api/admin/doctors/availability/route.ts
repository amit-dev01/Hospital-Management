import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const dayParam = searchParams.get('day');
    const dayOfWeek = dayParam !== null ? parseInt(dayParam) : new Date().getDay();

    // Verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Fetch all doctors
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        experience_years,
        is_verified,
        profiles!id ( full_name, phone )
      `);
      
    if (error) throw error;

    // Fetch availabilities for the requested day
    const { data: availabilities } = await supabase
      .from('doctor_availability')
      .select('doctor_id, is_active, max_patients_per_day, start_time, end_time')
      .eq('day_of_week', dayOfWeek);

    const availMap = new Map();
    availabilities?.forEach(a => availMap.set(a.doctor_id, a));

    const finalDoctors = doctors.map(doc => ({
      ...doc,
      day_availability: availMap.get(doc.id) || null
    }));

    return NextResponse.json({ doctors: finalDoctors, day: dayOfWeek }, { status: 200 });

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

    const { doctorId, isActive, maxPatients, day } = await req.json();
    const dayOfWeek = day !== undefined ? parseInt(day) : new Date().getDay();

    // Upsert the availability for the specified day
    const { data: existing } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('doctor_availability')
        .update({ 
          is_active: isActive, 
          max_patients_per_day: maxPatients 
        })
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
