-- =====================================================
-- TEACHER MANAGE STUDENT PASSWORD
-- =====================================================
-- Functions for teachers to manage student passwords
-- =====================================================

-- Function 1: Set/Update student password (by teacher)
CREATE OR REPLACE FUNCTION teacher_set_student_password(
  p_siswa_id UUID,
  p_new_password TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  has_password BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_siswa RECORD;
  v_hashed_password TEXT;
BEGIN
  -- Validate password length (minimum 4 characters)
  IF LENGTH(p_new_password) < 4 THEN
    RETURN QUERY SELECT FALSE, 'Password minimal 4 karakter'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if student exists
  SELECT * INTO v_siswa
  FROM public.siswa
  WHERE id = p_siswa_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Siswa tidak ditemukan'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Hash password
  v_hashed_password := crypt(p_new_password, gen_salt('bf'));

  -- Update password
  UPDATE public.siswa
  SET password = v_hashed_password
  WHERE id = p_siswa_id;

  RETURN QUERY SELECT TRUE, 'Password berhasil diset'::TEXT, TRUE;
END;
$$;

-- Function 2: Remove student password (set to NULL)
CREATE OR REPLACE FUNCTION teacher_remove_student_password(
  p_siswa_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_siswa RECORD;
BEGIN
  -- Check if student exists
  SELECT * INTO v_siswa
  FROM public.siswa
  WHERE id = p_siswa_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Siswa tidak ditemukan'::TEXT;
    RETURN;
  END IF;

  -- Set password to NULL
  UPDATE public.siswa
  SET password = NULL
  WHERE id = p_siswa_id;

  RETURN QUERY SELECT TRUE, 'Password berhasil dihapus (siswa bisa login tanpa password)'::TEXT;
END;
$$;

-- Function 3: Check if student has password
CREATE OR REPLACE FUNCTION check_student_has_password(
  p_siswa_id UUID
)
RETURNS TABLE(
  has_password BOOLEAN,
  student_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_siswa RECORD;
BEGIN
  SELECT * INTO v_siswa
  FROM public.siswa
  WHERE id = p_siswa_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, ''::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    (v_siswa.password IS NOT NULL) as has_password,
    v_siswa.nama as student_name;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION teacher_set_student_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION teacher_remove_student_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_student_has_password TO anon, authenticated;

-- Comments
COMMENT ON FUNCTION teacher_set_student_password IS 'Teacher can set/update student password. Minimum 4 characters.';
COMMENT ON FUNCTION teacher_remove_student_password IS 'Teacher can remove student password (set to NULL). Student can then login without password.';
COMMENT ON FUNCTION check_student_has_password IS 'Check if student has password set.';
