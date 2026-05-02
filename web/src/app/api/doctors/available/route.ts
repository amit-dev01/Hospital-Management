import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailableSlots } from '@/lib/appointments/availabilityHelper';

/**
 * GET /api/doctors/available
 * Query params: date (required), specialization?, doctorId?
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const date = searchParams.get('date');
    const specialization = searchParams.get('specialization');
    const doctorId = searchParams.get('doctorId');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'date query param is required (YYYY-MM-DD)' },
        { status: 400 },
      );
    }

    // ── Fetch matching doctors ────────────────────────────────────────────────
    let query = supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        experience_years,
        is_verified,
        profiles (
          full_name,
          phone
        )
      `)
      .eq('is_verified', true);

    if (doctorId) query = query.eq('id', doctorId);
    if (specialization) query = query.ilike('specialization', `%${specialization}%`);

    const { data: doctors, error: doctorError } = await query;

    if (doctorError) {
      return NextResponse.json({ error: doctorError.message }, { status: 500 });
    }

    // ── Fetch available slots for each doctor ─────────────────────────────────
    const results = await Promise.all(
      (doctors ?? []).map(async (doctor: any) => {
        const { slots, availability, bookedCount, maxPatients } =
          await getAvailableSlots(supabase, doctor.id, date);

        const availableSlots = slots.filter((s) => s.available).map((s) => s.time);

        return {
          doctor: {
            id: doctor.id,
            name: doctor.profiles?.full_name ?? 'Unknown',
            phone: doctor.profiles?.phone ?? null,
            specialization: doctor.specialization,
            experienceYears: doctor.experience_years,
          },
          date,
          availableSlots,
          totalSlots: slots.length,
          bookedCount,
          maxPatients,
          workingHours: availability
            ? { start: availability.start_time, end: availability.end_time }
            : null,
          isAvailableToday: availableSlots.length > 0,
        };
      }),
    );

    return NextResponse.json({ date, doctors: results }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
