-- Create table for guiding resource level progress
CREATE TABLE IF NOT EXISTS public.guiding_resource_level_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  level INTEGER NOT NULL, -- 1, 2, 3, 4
  answers JSONB DEFAULT '{}'::jsonb, -- Stores student answers (no validation)
  submitted BOOLEAN DEFAULT FALSE,
  show_evaluation BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one progress per student per class per level
  UNIQUE(siswa_id, kelas_id, level)
);

-- Add RLS policies
ALTER TABLE public.guiding_resource_level_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only see and update their own progress
CREATE POLICY "Students can view own level progress"
  ON public.guiding_resource_level_progress
  FOR SELECT
  USING (siswa_id = auth.uid());

CREATE POLICY "Students can insert own level progress"
  ON public.guiding_resource_level_progress
  FOR INSERT
  WITH CHECK (siswa_id = auth.uid());

CREATE POLICY "Students can update own level progress"
  ON public.guiding_resource_level_progress
  FOR UPDATE
  USING (siswa_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_level_progress_siswa_kelas 
  ON public.guiding_resource_level_progress(siswa_id, kelas_id, level);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_guiding_resource_level_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_guiding_resource_level_progress_updated_at
  BEFORE UPDATE ON public.guiding_resource_level_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_guiding_resource_level_progress_updated_at();

-- Add comment
COMMENT ON TABLE public.guiding_resource_level_progress IS 'Stores student progress for each level of guiding resource (A, B, C, D)';
