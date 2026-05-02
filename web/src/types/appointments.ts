// ── Appointment status ────────────────────────────────────────────────────────
export type AppointmentStatus = 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

// ── Full appointment row (DB shape) ──────────────────────────────────────────
export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;           // ISO date string "YYYY-MM-DD"
  time_slot: string;      // "HH:MM" 24-hr
  status: AppointmentStatus;
  priority: number;       // 1=Emergency 2=Pregnant 3=Senior 4=Regular
  is_emergency: boolean;
  is_pregnant: boolean;
  is_senior_citizen: boolean;
  symptoms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── POST /api/appointments/book request body ──────────────────────────────────
export interface BookAppointmentInput {
  doctorId: string;
  patientId: string;
  date: string;         // "YYYY-MM-DD"
  timeSlot: string;     // "HH:MM"
  isEmergency?: boolean;
  isPregnant?: boolean;
  isSeniorCitizen?: boolean;
  symptoms?: string;
  notes?: string;
}

// ── Time slot ─────────────────────────────────────────────────────────────────
export interface TimeSlot {
  time: string;         // "HH:MM"
  available: boolean;
  bookedBy?: string | null;
}

// ── Doctor availability row ───────────────────────────────────────────────────
export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number;          // 0=Sun … 6=Sat
  start_time: string;           // "HH:MM"
  end_time: string;             // "HH:MM"
  slot_duration_minutes: number;
  max_patients_per_day: number;
  is_active: boolean;
}

// ── Validation error shape ────────────────────────────────────────────────────
export interface ValidationError {
  field: string;
  message: string;
}
