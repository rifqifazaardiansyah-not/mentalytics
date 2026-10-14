-- Alter guiding_resource_level_progress table to remove validation columns
-- This migration removes the results and score columns since we no longer validate answers

-- Drop the columns if they exist
ALTER TABLE public.guiding_resource_level_progress 
  DROP COLUMN IF EXISTS results,
  DROP COLUMN IF EXISTS score;

-- Update comment to reflect new behavior
COMMENT ON TABLE public.guiding_resource_level_progress IS 'Stores student answers for each level of guiding resource (no validation, answers saved as-is)';

-- Update comment on answers column
COMMENT ON COLUMN public.guiding_resource_level_progress.answers IS 'Student answers stored as JSONB without validation';
