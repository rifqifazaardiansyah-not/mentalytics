-- =====================================================
-- ADD PASSWORD COLUMN TO SISWA TABLE
-- =====================================================
-- Purpose: Add password field for student authentication
-- Password is NULL by default for existing students (backward compatible)
-- New students must set password on first login
-- =====================================================

-- Step 1: Add password column (nullable for backward compatibility)
ALTER TABLE public.siswa 
ADD COLUMN IF NOT EXISTS password TEXT NULL;

-- Step 2: Add index for faster password lookups
CREATE INDEX IF NOT EXISTS idx_siswa_nama_kelas 
ON public.siswa(nama, kelas_id);

-- Step 3: Create function to verify student login
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
  password_valid BOOLEAN
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
    -- Student doesn't exist yet - needs to be created with password
    RETURN QUERY SELECT 
      NULL::UUID as siswa_id,
      v_kelas.id as kelas_id,
      p_nama as nama_siswa,
      v_kelas.kode_kelas as kode_kelas,
      v_kelas.nama_kelas as nama_kelas,
      TRUE as needs_password,
      FALSE as password_valid;
    RETURN;
  END IF;

  -- Student exists - check password
  IF v_siswa.password IS NULL THEN
    -- Old student without password - can login without password
    RETURN QUERY SELECT 
      v_siswa.id as siswa_id,
      v_siswa.kelas_id as kelas_id,
      v_siswa.nama as nama_siswa,
      v_kelas.kode_kelas as kode_kelas,
      v_kelas.nama_kelas as nama_kelas,
      FALSE as needs_password,
      TRUE as password_valid;
  ELSE
    -- Student has password - must verify
    IF p_password IS NULL OR v_siswa.password != crypt(p_password, v_siswa.password) THEN
      -- Password required but not provided or wrong
      RETURN QUERY SELECT 
        NULL::UUID as siswa_id,
        v_kelas.id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        TRUE as needs_password,
        FALSE as password_valid;
    ELSE
      -- Password correct
      RETURN QUERY SELECT 
        v_siswa.id as siswa_id,
        v_siswa.kelas_id as kelas_id,
        v_siswa.nama as nama_siswa,
        v_kelas.kode_kelas as kode_kelas,
        v_kelas.nama_kelas as nama_kelas,
        FALSE as needs_password,
        TRUE as password_valid;
    END IF;
  END IF;
END;
$$;

-- Step 4: Create function to set/update student password
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
  v_siswa RECORD;
  v_hashed_password TEXT;
BEGIN
  -- Validate password length (minimum 4 characters)
  IF LENGTH(p_password) < 4 THEN
    RAISE EXCEPTION 'Password minimal 4 karakter';
  END IF;

  -- Find the class
  SELECT * INTO v_kelas
  FROM public.kelas k
  WHERE UPPER(k.kode_kelas) = UPPER(p_kode_kelas);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kode kelas tidak ditemukan';
  END IF;

  -- Hash password using pgcrypto
  v_hashed_password := crypt(p_password, gen_salt('bf'));

  -- Check if student exists
  SELECT * INTO v_siswa
  FROM public.siswa s
  WHERE s.nama = p_nama 
    AND s.kelas_id = v_kelas.id;

  IF FOUND THEN
    -- Update existing student password
    UPDATE public.siswa
    SET password = v_hashed_password,
        updated_at = NOW()
    WHERE id = v_siswa.id
    RETURNING 
      id as siswa_id,
      kelas_id,
      nama as nama_siswa
    INTO v_siswa;
  ELSE
    -- Create new student with password
    INSERT INTO public.siswa (kelas_id, nama, password)
    VALUES (v_kelas.id, p_nama, v_hashed_password)
    RETURNING 
      id as siswa_id,
      kelas_id,
      nama as nama_siswa
    INTO v_siswa;
  END IF;

  -- Return success
  RETURN QUERY SELECT 
    v_siswa.siswa_id,
    v_siswa.kelas_id,
    v_siswa.nama_siswa,
    v_kelas.kode_kelas,
    v_kelas.nama_kelas,
    TRUE as success;
END;
$$;

-- Step 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_student_login TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_student_password TO anon, authenticated;

-- Step 6: Comment for documentation
COMMENT ON COLUMN public.siswa.password IS 'Hashed password for student authentication. NULL for existing students (backward compatible).';
COMMENT ON FUNCTION verify_student_login IS 'Verifies student login credentials. Returns needs_password=true if password required but not provided/invalid.';
COMMENT ON FUNCTION set_student_password IS 'Sets or updates student password. Creates new student if not exists.';
