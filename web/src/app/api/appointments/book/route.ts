import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBookingInput } from '@/lib/appointments/validators';
import { getAvailableSlots, derivePriority } from '@/lib/appointments/availabilityHelper';
import { generateTokenNumber } from '@/lib/queue/tokenHelpers';
import { calculateQueueWithWaitTimes } from '@/lib/queue/tokenHelpers';

/**
 * POST /api/appointments/book
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // ── 1. Validate input ─────────────────────────────────────────────────────
    const { data: input, errors } = validateBookingInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }
    if (!input) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const {
      doctorId, patientId, date, timeSlot,
      isEmergency, isPregnant, isSeniorCitizen,
      symptoms, notes,
    } = input;

    // ── 2. Ensure doctor exists and is verified ───────────────────────────────
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('is_verified')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      return NextResponse.json(
        { error: 'Doctor not found.' },
        { status: 404 },
      );
    }

    if (!doctor.is_verified) {
      return NextResponse.json(
        { error: 'Doctor is not verified yet.' },
        { status: 403 },
      );
    }

    // ── 3. Check slot availability ────────────────────────────────────────────
    const { slots, availability, bookedCount, maxPatients } =
      await getAvailableSlots(supabase, doctorId, date);

    if (!availability) {
      return NextResponse.json(
        { error: 'Doctor is not available on this date' },
        { status: 409 },
      );
    }

    // Check max daily patient limit
    if (bookedCount >= maxPatients) {
      return NextResponse.json(
        { error: `Doctor has reached the daily limit of ${maxPatients} patients` },
        { status: 409 },
      );
    }

    // Check specific slot availability
    const requestedSlot = slots.find((s) => s.time === timeSlot);
    if (!requestedSlot || !requestedSlot.available) {
      return NextResponse.json(
        { error: `Time slot ${timeSlot} is already booked or unavailable` },
        { status: 409 },
      );
    }

    // ── 3. Prevent duplicate booking for same patient + doctor + date ─────────
    const { data: existingBooking } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .eq('date', date)
      .not('status', 'eq', 'cancelled')
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Patient already has an appointment with this doctor on this date' },
        { status: 409 },
      );
    }

    // ── 4. Derive priority ────────────────────────────────────────────────────
    const priority = derivePriority(
      isEmergency ?? false,
      isPregnant ?? false,
      isSeniorCitizen ?? false,
    );

    // ── 5. Insert appointment ─────────────────────────────────────────────────
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert([{
        doctor_id: doctorId,
        patient_id: patientId,
        date,
        time_slot: timeSlot,
        status: 'confirmed',
        priority,
        is_emergency: isEmergency ?? false,
        is_pregnant: isPregnant ?? false,
        is_senior_citizen: isSeniorCitizen ?? false,
        symptoms: symptoms ?? null,
        notes: notes ?? null,
      }])
      .select()
      .single();

    if (apptError) {
      // Handle race-condition duplicate (unique constraint violation)
      if (apptError.code === '23505') {
        return NextResponse.json(
          { error: 'This slot was just booked by another patient. Please choose a different slot.' },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: apptError.message }, { status: 500 });
    }

    // ── 6. Auto-generate token ────────────────────────────────────────────────
    const tokenNumber = await generateTokenNumber(supabase, doctorId);

    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .insert([{
        appointment_id: appointment.id,
        doctor_id: doctorId,
        token_number: tokenNumber,
        priority,
        status: 'waiting',
      }])
      .select()
      .single();

    if (tokenError) {
      // Appointment was created; token generation failed — log but don't fail the booking
      console.error('Token generation error:', tokenError.message);
    }

    // ── 7. Calculate estimated wait time ──────────────────────────────────────
    // Fetch avg consultation time for this doctor (default 10 mins)
    const { data: settings } = await supabase
      .from('doctor_queue_settings')
      .select('avg_consultation_min')
      .eq('doctor_id', doctorId)
      .maybeSingle();

    const avgTime = settings?.avg_consultation_min ?? 10;
    const queue = await calculateQueueWithWaitTimes(supabase, doctorId, avgTime);
    const myQueueEntry = queue.find((t: any) => t.appointment_id === appointment.id);
    const estimatedWaitTime = myQueueEntry?.estimatedWaitTime ?? null;
    const queuePosition = queue.findIndex((t: any) => t.appointment_id === appointment.id) + 1;

    // ── 8. Return confirmation ────────────────────────────────────────────────
    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment,
      token: token ?? null,
      queuePosition,
      estimatedWaitTime,
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
