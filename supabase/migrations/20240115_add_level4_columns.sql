-- Add Level 4 specific columns to guiding_resource_level_progress
-- Level 4 has Pola Penyebaran challenge and Outlier challenge

ALTER TABLE public.guiding_resource_level_progress 
  ADD COLUMN IF NOT EXISTS pola_answers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pola_progress JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS outlier_progress JSONB DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN public.guiding_resource_level_progress.pola_answers IS 'Level 4: Student answers for Pola Penyebaran (linear/non-linear) challenge';
COMMENT ON COLUMN public.guiding_resource_level_progress.pola_progress IS 'Level 4: Progress tracking for Pola Penyebaran challenge';
COMMENT ON COLUMN public.guiding_resource_level_progress.outlier_progress IS 'Level 4: Progress tracking for Outlier identification challenge';
