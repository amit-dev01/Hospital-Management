import type { TimeSlot, DoctorAvailability } from '@/types/appointments';

// ── Generate all slots between start and end time ─────────────────────────────

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number,
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + slotDurationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += slotDurationMinutes;
  }

  return slots;
}

// ── Get available slots for a doctor on a given date ──────────────────────────

export async function getAvailableSlots(
  supabase: any,
  doctorId: string,
  date: string, // "YYYY-MM-DD"
): Promise<{
  slots: TimeSlot[];
  availability: DoctorAvailability | null;
  bookedCount: number;
  maxPatients: number;
}> {
  const [year, month, day] = date.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0=Sun … 6=Sat

  // 1. Fetch doctor's schedule for that day
  const { data: avail, error: availError } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .single();

  if (availError || !avail) {
    return { slots: [], availability: null, bookedCount: 0, maxPatients: 0 };
  }

  // 2. Fetch already-booked slots for this doctor on this date
  const { data: booked, error: bookError } = await supabase
    .from('appointments')
    .select('time_slot, patient_id')
    .eq('doctor_id', doctorId)
    .eq('date', date)
    .not('status', 'eq', 'cancelled');

  if (bookError) throw new Error(`Slot fetch error: ${bookError.message}`);

  const bookedMap = new Map<string, string>(
    (booked ?? []).map((b: any) => [b.time_slot, b.patient_id]),
  );
  const bookedCount = bookedMap.size;

  // 3. Generate all slots and mark availability
  const allSlots = generateTimeSlots(
    avail.start_time,
    avail.end_time,
    avail.slot_duration_minutes,
  );

  const slots: TimeSlot[] = allSlots.map((time) => ({
    time,
    available: !bookedMap.has(time) && bookedCount < avail.max_patients_per_day,
    bookedBy: bookedMap.get(time) ?? null,
  }));

  return {
    slots,
    availability: avail as DoctorAvailability,
    bookedCount,
    maxPatients: avail.max_patients_per_day,
  };
}

// ── Derive priority number from booking flags ─────────────────────────────────

export function derivePriority(
  isEmergency: boolean,
  isPregnant: boolean,
  isSeniorCitizen: boolean,
): number {
  if (isEmergency) return 1;
  if (isPregnant) return 2;
  if (isSeniorCitizen) return 3;
  return 4;
}

// ── Build day boundaries for a given date ─────────────────────────────────────

export function dayBounds(date: string): { start: string; end: string } {
  return {
    start: `${date}T00:00:00.000Z`,
    end: `${date}T23:59:59.999Z`,
  };
}
