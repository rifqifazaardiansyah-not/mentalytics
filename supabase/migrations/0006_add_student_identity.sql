-- 0006_add_student_identity.sql
-- Add student identity fields and fix survey score constraint

-- 1. Add identity fields to siswa table
ALTER TABLE siswa 
ADD COLUMN IF NOT EXISTS usia int,
ADD COLUMN IF NOT EXISTS jenis_kelamin text CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan'));

-- 2. Fix survey_answers_raw constraint (0-4 for bullying OBVQ-R scale)
ALTER TABLE survey_answers_raw 
DROP CONSTRAINT IF EXISTS survey_answers_raw_skor_check;

ALTER TABLE survey_answers_raw 
ADD CONSTRAINT survey_answers_raw_skor_check 
CHECK (skor BETWEEN 0 AND 4);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_siswa_jenis_kelamin ON siswa(jenis_kelamin);
CREATE INDEX IF NOT EXISTS idx_siswa_usia ON siswa(usia);
