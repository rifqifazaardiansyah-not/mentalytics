-- Migration: Create reflections table
-- This table stores student reflections after completing the solution phase

CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES siswa(id) ON DELETE CASCADE,
  
  -- Rating questions (1-5 scale)
  rating_q1 INTEGER CHECK (rating_q1 >= 0 AND rating_q1 <= 5),
  rating_q2 INTEGER CHECK (rating_q2 >= 0 AND rating_q2 <= 5),
  rating_q3 INTEGER CHECK (rating_q3 >= 0 AND rating_q3 <= 5),
  rating_q4 INTEGER CHECK (rating_q4 >= 0 AND rating_q4 <= 5),
  
  -- Essay answer
  essay_answer TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one reflection per student
  UNIQUE(siswa_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reflections_siswa ON reflections(siswa_id);

-- RLS Policies
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Policy: Students can read their own reflection
CREATE POLICY "Students can view own reflection"
  ON reflections
  FOR SELECT
  USING (siswa_id IN (SELECT id FROM siswa));

-- Policy: Students can insert their own reflection
CREATE POLICY "Students can insert own reflection"
  ON reflections
  FOR INSERT
  WITH CHECK (siswa_id IN (SELECT id FROM siswa));

-- Policy: Students can update their own reflection
CREATE POLICY "Students can update own reflection"
  ON reflections
  FOR UPDATE
  USING (siswa_id IN (SELECT id FROM siswa))
  WITH CHECK (siswa_id IN (SELECT id FROM siswa));

-- Policy: Students can delete their own reflection
CREATE POLICY "Students can delete own reflection"
  ON reflections
  FOR DELETE
  USING (siswa_id IN (SELECT id FROM siswa));

-- Comments
COMMENT ON TABLE reflections IS 'Stores student reflections after completing the solution phase';
COMMENT ON COLUMN reflections.rating_q1 IS 'Q1: Pandangan tentang bullying berubah (1-5)';
COMMENT ON COLUMN reflections.rating_q2 IS 'Q2: Lebih peduli karena data dari teman sendiri (1-5)';
COMMENT ON COLUMN reflections.rating_q3 IS 'Q3: Lebih percaya diri membaca statistik (1-5)';
COMMENT ON COLUMN reflections.rating_q4 IS 'Q4: Data statistik membantu jelaskan masalah nyata (1-5)';
COMMENT ON COLUMN reflections.essay_answer IS 'Essay: Hal yang paling membekas';
