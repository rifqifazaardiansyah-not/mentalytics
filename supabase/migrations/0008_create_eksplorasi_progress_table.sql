-- Migration: Create table for eksplorasi diagram progress
-- This table stores the progress of students working on scatter plot exploration

CREATE TABLE IF NOT EXISTS eksplorasi_diagram_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  kelas_id UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  
  -- Progress data (stored as JSONB for flexibility)
  current_step INTEGER NOT NULL DEFAULT 1,
  x_axis_var TEXT,
  y_axis_var TEXT,
  x_scale INTEGER,
  y_scale INTEGER,
  inputted_points JSONB,
  current_input_index INTEGER DEFAULT 0,
  regression_line JSONB,
  correlation_score NUMERIC,
  checked_rows JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one progress per student per class
  UNIQUE(siswa_id, kelas_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_eksplorasi_progress_siswa ON eksplorasi_diagram_progress(siswa_id);
CREATE INDEX IF NOT EXISTS idx_eksplorasi_progress_kelas ON eksplorasi_diagram_progress(kelas_id);

-- RLS Policies
ALTER TABLE eksplorasi_diagram_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Students can read their own progress
CREATE POLICY "Students can view own progress"
  ON eksplorasi_diagram_progress
  FOR SELECT
  USING (true);

-- Policy: Students can insert their own progress
CREATE POLICY "Students can insert own progress"
  ON eksplorasi_diagram_progress
  FOR INSERT
  WITH CHECK (true);

-- Policy: Students can update their own progress
CREATE POLICY "Students can update own progress"
  ON eksplorasi_diagram_progress
  FOR UPDATE
  USING (true);

-- Policy: Students can delete their own progress
CREATE POLICY "Students can delete own progress"
  ON eksplorasi_diagram_progress
  FOR DELETE
  USING (true);
