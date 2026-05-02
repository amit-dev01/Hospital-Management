import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a generic client that doesn't use cookies so it doesn't log the admin out
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, password, specialization, experience, hospitalName, licenseNumber } = body;

    // 1. Sign up user
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'doctor',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email already exists.' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Failed to create user account.' }, { status: 400 });
    }

    const userId = data.user.id;

    // 2. Profile is usually created by triggers or upserted manually.
    // Let's upsert the profile.
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      role: 'doctor',
      full_name: name,
      phone: phone,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 3. Insert doctor-specific data (auto-verified since admin adds them)
    const { error: doctorError } = await supabaseAdmin.from('doctors').upsert({
      id: userId,
      specialization: specialization,
      experience_years: parseInt(experience, 10),
      hospital_name: hospitalName,
      license_number: licenseNumber,
      is_verified: true, // Auto verified!
    });

    if (doctorError) {
      return NextResponse.json({ error: doctorError.message }, { status: 400 });
    }

    // 4. Also create default doctor availability so they show up in booking
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat
    const availabilityData = days.map((day) => ({
      doctor_id: userId,
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 15,
      max_patients_per_day: 20,
      is_active: true
    }));

    await supabaseAdmin.from('doctor_availability').upsert(availabilityData, { onConflict: 'doctor_id, day_of_week' });

    return NextResponse.json({ success: true, message: 'Doctor added successfully' }, { status: 200 });

  } catch (err) {
    console.error('Add doctor error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
