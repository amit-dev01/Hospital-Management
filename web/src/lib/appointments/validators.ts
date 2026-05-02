import type { BookAppointmentInput, ValidationError } from '@/types/appointments';

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidDate(str: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function isValidTimeSlot(str: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(str);
}

function isFutureDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) >= today;
}

// ── Main validator ────────────────────────────────────────────────────────────

export function validateBookingInput(body: any): {
  data: BookAppointmentInput | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  if (!body.doctorId || typeof body.doctorId !== 'string') {
    errors.push({ field: 'doctorId', message: 'doctorId is required' });
  }
  if (!body.patientId || typeof body.patientId !== 'string') {
    errors.push({ field: 'patientId', message: 'patientId is required' });
  }
  if (!body.date || !isValidDate(body.date)) {
    errors.push({ field: 'date', message: 'date must be in YYYY-MM-DD format' });
  } else if (!isFutureDate(body.date)) {
    errors.push({ field: 'date', message: 'date must be today or a future date' });
  }
  if (!body.timeSlot || !isValidTimeSlot(body.timeSlot)) {
    errors.push({ field: 'timeSlot', message: 'timeSlot must be in HH:MM 24-hr format (e.g. "09:30")' });
  }

  // At most one priority flag should be true
  const flags = [body.isEmergency, body.isPregnant, body.isSeniorCitizen].filter(Boolean);
  if (flags.length > 1) {
    errors.push({
      field: 'patientCategory',
      message: 'Only one of isEmergency, isPregnant, isSeniorCitizen can be true',
    });
  }

  if (errors.length > 0) return { data: null, errors };

  return {
    data: {
      doctorId: body.doctorId.trim(),
      patientId: body.patientId.trim(),
      date: body.date.trim(),
      timeSlot: body.timeSlot.trim(),
      isEmergency: Boolean(body.isEmergency),
      isPregnant: Boolean(body.isPregnant),
      isSeniorCitizen: Boolean(body.isSeniorCitizen),
      symptoms: body.symptoms?.trim() || null,
      notes: body.notes?.trim() || null,
    },
    errors: [],
  };
}

// ── Status transition validator ────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed:    ['in-progress', 'cancelled'],
  'in-progress': ['completed', 'cancelled'],
  completed:    [],
  cancelled:    [],
};

export function validateStatusTransition(
  current: string,
  next: string,
): { valid: boolean; message?: string } {
  const allowed = VALID_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    return {
      valid: false,
      message: `Cannot transition from "${current}" to "${next}". Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }
  return { valid: true };
}
