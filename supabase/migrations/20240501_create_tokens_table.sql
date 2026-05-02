-- ============================================================
-- Token Queue Management System
-- Migration: create_tokens_table
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tokens (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   UUID        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id        TEXT        NOT NULL,

  -- e.g. "DOC001-20240501-003"
  token_number     TEXT        NOT NULL UNIQUE,

  -- 1=Emergency, 2=Pregnant, 3=Senior, 4=Regular
  priority         SMALLINT    NOT NULL DEFAULT 4 CHECK (priority BETWEEN 1 AND 4),

  status           TEXT        NOT NULL DEFAULT 'waiting'
                   CHECK (status IN ('waiting', 'in-progress', 'done', 'cancelled')),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at       TIMESTAMPTZ NULL,
  completed_at     TIMESTAMPTZ NULL
);

-- ============================================================
-- INDEXES for fast queue retrieval
-- ============================================================
-- Main queue lookup: get today's queue for a doctor, sorted by priority then FIFO
CREATE INDEX IF NOT EXISTS idx_tokens_doctor_status_priority
  ON tokens (doctor_id, status, priority ASC, created_at ASC);

-- Patient looks up their own token
CREATE INDEX IF NOT EXISTS idx_tokens_appointment
  ON tokens (appointment_id);

-- ============================================================
-- AUTO-SET completed_at WHEN status → done
-- ============================================================
CREATE OR REPLACE FUNCTION set_token_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    NEW.completed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_token_completed ON tokens;
CREATE TRIGGER trg_token_completed
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION set_token_completed_at();

-- ============================================================
-- DOCTOR SETTINGS TABLE  (configurable avg consultation time)
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_queue_settings (
  doctor_id           TEXT    PRIMARY KEY,
  avg_consultation_min INTEGER NOT NULL DEFAULT 10 CHECK (avg_consultation_min > 0),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_queue_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read tokens
CREATE POLICY "Authenticated can read tokens"
  ON tokens FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow service role full access (used by API routes via service key)
CREATE POLICY "Service role full access on tokens"
  ON tokens FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on doctor_queue_settings"
  ON doctor_queue_settings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- HELPFUL VIEW: today's active queue with wait position
-- ============================================================
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
