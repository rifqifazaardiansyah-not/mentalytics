-- Add challenge columns to guiding_resource_level_progress for interactive challenges
-- Level 2 onwards may have interactive challenges before evaluation

ALTER TABLE public.guiding_resource_level_progress 
  ADD COLUMN IF NOT EXISTS challenge_answers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS challenge_progress JSONB DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN public.guiding_resource_level_progress.challenge_answers IS 'Student answers for interactive challenges (e.g., drag-and-drop)';
COMMENT ON COLUMN public.guiding_resource_level_progress.challenge_progress IS 'Progress tracking for interactive challenges';
