-- =====================================================
-- FIX AMBIGUOUS COLUMN REFERENCE IN set_student_password
-- =====================================================
-- Issue: Column "kelas_id" is ambiguous in RETURNING clause
-- Solution: Use table alias to explicitly reference columns
-- =====================================================

CREATE OR REPLACE FUNCTION set_student_password(
  p_nama TEXT,
  p_kode_kelas TEXT,
  p_password TEXT
)
RETURNS TABLE(
  siswa_id UUID,
  kelas_id UUID,
  nama_siswa TEXT,
  kode_kelas TEXT,
  nama_kelas TEXT,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_kelas RECORD;
  v_siswa_id UUID;
  v_kelas_id UUID;
  v_nama_siswa TEXT;
  v_hashed_password TEXT;
BEGIN
  -- Validate password length (minimum 4 characters)
  IF LENGTH(p_password) < 4 THEN
    RAISE EXCEPTION 'Password minimal 4 karakter';
  END IF;

  -- Find the class
  SELECT k.id, k.kode_kelas, k.nama_kelas 
  INTO v_kelas
  FROM public.kelas k
  WHERE UPPER(k.kode_kelas) = UPPER(p_kode_kelas);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kode kelas tidak ditemukan';
  END IF;

  -- Hash password using pgcrypto
  v_hashed_password := crypt(p_password, gen_salt('bf'));

  -- Check if student exists
  SELECT s.id INTO v_siswa_id
  FROM public.siswa s
  WHERE s.nama = p_nama 
    AND s.kelas_id = v_kelas.id;

  IF FOUND THEN
    -- Update existing student password
    UPDATE public.siswa s
    SET password = v_hashed_password,
        updated_at = NOW()
    WHERE s.id = v_siswa_id
    RETURNING s.id, s.kelas_id, s.nama
    INTO v_siswa_id, v_kelas_id, v_nama_siswa;
  ELSE
    -- Create new student with password
    INSERT INTO public.siswa (kelas_id, nama, password)
    VALUES (v_kelas.id, p_nama, v_hashed_password)
    RETURNING id, siswa.kelas_id, nama
    INTO v_siswa_id, v_kelas_id, v_nama_siswa;
  END IF;

  -- Return success with explicit variable names
  RETURN QUERY SELECT 
    v_siswa_id as siswa_id,
    v_kelas_id as kelas_id,
    v_nama_siswa as nama_siswa,
    v_kelas.kode_kelas as kode_kelas,
    v_kelas.nama_kelas as nama_kelas,
    TRUE as success;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION set_student_password TO anon, authenticated;

-- Test the function
DO $$
DECLARE
  v_result RECORD;
BEGIN
  -- This is just a syntax check, not a real test
  RAISE NOTICE 'Function set_student_password has been recreated successfully';
END $$;
