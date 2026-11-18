-- =====================================================
-- FIX GUIDING RESOURCE LEVEL PROGRESS RLS
-- =====================================================
-- Issue: RLS policies menggunakan auth.uid() tapi siswa tidak pakai Supabase Auth
-- Solution: Change to public access untuk prototype (using true)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Students can view own level progress" ON public.guiding_resource_level_progress;
DROP POLICY IF EXISTS "Students can insert own level progress" ON public.guiding_resource_level_progress;
DROP POLICY IF EXISTS "Students can update own level progress" ON public.guiding_resource_level_progress;

-- Create new public policies (prototype mode)
-- ⚠️ WARNING: These policies allow all access - NOT for production!
CREATE POLICY "Public can view level progress"
  ON public.guiding_resource_level_progress
  FOR SELECT
  USING (true);

CREATE POLICY "Public can insert level progress"
  ON public.guiding_resource_level_progress
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update level progress"
  ON public.guiding_resource_level_progress
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete level progress"
  ON public.guiding_resource_level_progress
  FOR DELETE
  USING (true);

-- Verify RLS is still enabled
ALTER TABLE public.guiding_resource_level_progress ENABLE ROW LEVEL SECURITY;

-- Add comment about security
COMMENT ON TABLE public.guiding_resource_level_progress IS 'Stores student progress for guiding resource levels. RLS set to public for prototype (⚠️ NOT production-ready!)';

-- Test query to verify access
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for guiding_resource_level_progress';
  RAISE NOTICE '⚠️ WARNING: Table now accessible publicly (prototype mode)';
  RAISE NOTICE '📝 Before production: Implement proper authentication & restrict RLS';
END $$;
