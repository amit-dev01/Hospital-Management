-- ============================================================
-- COMPLETE MIGRATION (run this entire file in one shot)
-- Order: drop view → fix tokens → create appointments → create availability → FK → RLS → seed
-- ============================================================

-- 1. Drop the blocking view
DROP VIEW IF EXISTS v_today_active_queue;

-- 2. Cast tokens.appointment_id from TEXT to UUID
ALTER TABLE tokens
  ALTER COLUMN appointment_id TYPE UUID
  USING appointment_id::UUID;

-- 3. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  patient_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date              DATE        NOT NULL,
  time_slot         TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed','in-progress','completed','cancelled')),
  priority          SMALLINT    NOT NULL DEFAULT 4 CHECK (priority BETWEEN 1 AND 4),
  is_emergency      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_pregnant       BOOLEAN     NOT NULL DEFAULT FALSE,
  is_senior_citizen BOOLEAN     NOT NULL DEFAULT FALSE,
  symptoms          TEXT        NULL,
  notes             TEXT        NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes on appointments
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_slot
  ON appointments (doctor_id, date, time_slot)
  WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS idx_appointments_patient
  ON appointments (patient_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
  ON appointments (doctor_id, date, priority ASC, time_slot ASC);

-- 5. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Create doctor_availability table
CREATE TABLE IF NOT EXISTS doctor_availability (
  id                    UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id             UUID     NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week           SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time            TEXT     NOT NULL,
  end_time              TEXT     NOT NULL,
  slot_duration_minutes INTEGER  NOT NULL DEFAULT 15 CHECK (slot_duration_minutes > 0),
  max_patients_per_day  INTEGER  NOT NULL DEFAULT 20 CHECK (max_patients_per_day > 0),
  is_active             BOOLEAN  NOT NULL DEFAULT TRUE,
  UNIQUE (doctor_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor
  ON doctor_availability (doctor_id, day_of_week);

-- 7. Add FK tokens → appointments (now that appointments exists)
ALTER TABLE tokens
  ADD CONSTRAINT fk_tokens_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;

-- 8. Recreate the view
CREATE OR REPLACE VIEW v_today_active_queue AS
SELECT
  t.*,
  ROW_NUMBER() OVER (
    PARTITION BY t.doctor_id
    ORDER BY t.priority ASC, t.created_at ASC
  )::int AS queue_position
FROM tokens t
WHERE
  t.created_at >= CURRENT_DATE
  AND t.created_at < CURRENT_DATE + INTERVAL '1 day'
  AND t.status IN ('waiting', 'in-progress');

-- 9. RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients see own appointments"
  ON appointments FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors see own schedule"
  ON appointments FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Service role full access on appointments"
  ON appointments FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on doctor_availability"
  ON doctor_availability FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read availability"
  ON doctor_availability FOR SELECT USING (auth.role() = 'authenticated');

-- 10. Seed default Mon-Sat schedule for all existing doctors
INSERT INTO doctor_availability
  (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_day)
SELECT
  d.id, s.day, '09:00', '17:00', 15, 20
FROM doctors d
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS s(day)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
