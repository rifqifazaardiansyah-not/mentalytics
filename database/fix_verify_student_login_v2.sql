-- =====================================================
-- FIX verify_student_login LOGIC
-- =====================================================
-- Issue 1: Siswa baru yang sudah buat password masih muncul UI "create"
-- Issue 2: Siswa lama (password NULL) harus bisa login dengan password kosong
-- =====================================================

-- Step 1: Drop existing function (required to change return type)
DROP FUNCTION IF EXISTS verify_student_login(TEXT, TEXT, TEXT);

-- Step 2: Create new function with has_password field
CREATE OR REPLACE FUNCTION verify_student_login(
  p_nama TEXT,
  p_kode_kelas TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS TABLE(
  siswa_id UUID,
  kelas_id UUID,
  nama_siswa TEXT,
  kode_kelas TEXT,
  nama_kelas TEXT,
  needs_password BOOLEAN,
  password_valid BOOLEAN,
  has_password BOOLEAN  -- NEW: indicate if student has password set
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_siswa RECORD;
  v_kelas RECORD;
BEGIN
  -- Find the class by code
  SELECT * INTO v_kelas
  FROM public.kelas k
  WHERE UPPER(k.kode_kelas) = UPPER(p_kode_kelas);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kode kelas tidak ditemukan';
  END IF;

  -- Find student in that class
  SELECT * INTO v_siswa
  FROM public.siswa s
  WHERE s.nama = p_nama 
    AND s.kelas_id = v_kelas.id;

  IF NOT FOUND THEN
    -- Student doesn't exist yet - needs to create account with password
    RETURN QUERY SELECT 
      NULL::UUID as siswa_id,
      v_kelas.id as kelas_id,
      p_nama as nama_siswa,
      v_kelas.kode_kelas as kode_kelas,
      v_kelas.nama_kelas as nama_kelas,
      TRUE as needs_password,
      FALSE as password_valid,
      FALSE as has_password;
    RETURN;
  END IF;

  -- Student exists - check password status
  IF v_siswa.password IS NULL THEN
    -- Old student without password - ALWAYS show modal
    IF p_password IS NULL THEN
      -- No password provided (initial check) - show modal first (don't auto-login)
      RETURN QUERY SELECT 
        v_siswa.id as siswa_id,
        v_siswa.kelas_id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        TRUE as needs_password,  -- Force modal to show
        FALSE as password_valid,  -- Not valid until modal submit
        FALSE as has_password;
    ELSIF p_password = '' THEN
      -- Empty password from modal (backward compatible) - allow login without setting password
      RETURN QUERY SELECT 
        v_siswa.id as siswa_id,
        v_siswa.kelas_id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        FALSE as needs_password,
        TRUE as password_valid,  -- Valid because no password is set
        FALSE as has_password;
    ELSE
      -- Password provided from modal (not empty) but student has NULL password
      -- REJECT with clear message: must use empty to login
      RAISE EXCEPTION 'Akun kamu belum memiliki password. Kosongkan isian password untuk masuk, atau hubungi guru untuk set password baru.';
    END IF;
  ELSE
    -- Student has password - must verify
    IF p_password IS NULL THEN
      -- Password required but not provided (initial check)
      RETURN QUERY SELECT 
        NULL::UUID as siswa_id,
        v_kelas.id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        TRUE as needs_password,
        FALSE as password_valid,
        TRUE as has_password;  -- Student HAS password set
    ELSIF p_password = '' THEN
      -- Empty password but student has password set - not allowed
      RETURN QUERY SELECT 
        NULL::UUID as siswa_id,
        v_kelas.id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        TRUE as needs_password,
        FALSE as password_valid,
        TRUE as has_password;  -- Student HAS password set
    ELSIF v_siswa.password = crypt(p_password, v_siswa.password) THEN
      -- Password correct
      RETURN QUERY SELECT 
        v_siswa.id as siswa_id,
        v_siswa.kelas_id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        FALSE as needs_password,
        TRUE as password_valid,
        TRUE as has_password;  -- Student HAS password set
    ELSE
      -- Password incorrect
      RETURN QUERY SELECT 
        NULL::UUID as siswa_id,
        v_kelas.id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        TRUE as needs_password,
        FALSE as password_valid,
        TRUE as has_password;  -- Student HAS password set
    END IF;
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION verify_student_login TO anon, authenticated;

-- Update comment
COMMENT ON FUNCTION verify_student_login IS 'Verifies student login. Returns has_password to differentiate between new students and existing students with password.';

-- Test scenarios
DO $$
BEGIN
  RAISE NOTICE '=== verify_student_login updated ===';
  RAISE NOTICE 'Scenario 1: Student not found → needs_password=TRUE, has_password=FALSE (create mode)';
  RAISE NOTICE 'Scenario 2: Student exists, password=NULL, p_password=NULL → needs_password=TRUE (show modal)';
  RAISE NOTICE 'Scenario 3: Student exists, password=NULL, p_password="" → login OK (backward compatible)';
  RAISE NOTICE 'Scenario 4: Student exists, password=NULL, p_password="anything" → REJECT with message (must use empty!)';
  RAISE NOTICE 'Scenario 5: Student exists, password=SET, p_password=NULL → needs_password=TRUE (show modal)';
  RAISE NOTICE 'Scenario 6: Student exists, password=SET, p_password="" → needs_password=TRUE (empty not allowed)';
  RAISE NOTICE 'Scenario 7: Student exists, password=SET, correct input → login OK';
  RAISE NOTICE 'Scenario 8: Student exists, password=SET, wrong input → needs_password=TRUE (retry)';
END $$;
