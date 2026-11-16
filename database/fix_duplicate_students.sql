-- FIX #2: Prevent duplicate students in same class (case-insensitive)
-- Student with same name (ignoring case and whitespace) should not be duplicated

DROP FUNCTION IF EXISTS join_class(TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION join_class(
  p_kode_kelas TEXT,
  p_nama_siswa TEXT
)
RETURNS TABLE (
  siswa_id UUID,
  kelas_id UUID,
  nama_siswa TEXT,
  kode_kelas TEXT,
  nama_kelas TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_kelas_id UUID;
  v_siswa_id UUID;
  v_existing_siswa_id UUID;
  v_nama_clean TEXT;
BEGIN
  -- Clean student name (trim whitespace)
  v_nama_clean := TRIM(p_nama_siswa);
  
  IF v_nama_clean = '' THEN
    RAISE EXCEPTION 'Nama siswa tidak boleh kosong';
  END IF;
  
  -- Check if class exists and is active
  SELECT k.id INTO v_kelas_id
  FROM kelas k
  WHERE k.kode_kelas = UPPER(p_kode_kelas)
    AND k.status = 'aktif';
  
  IF v_kelas_id IS NULL THEN
    RAISE EXCEPTION 'Kode kelas tidak valid atau kelas sudah tidak aktif';
  END IF;
  
  -- Check if student with same name already exists in this class (case-insensitive)
  SELECT s.id INTO v_existing_siswa_id
  FROM siswa s
  WHERE LOWER(TRIM(s.nama)) = LOWER(v_nama_clean)
    AND s.kelas_id = v_kelas_id;
  
  IF v_existing_siswa_id IS NOT NULL THEN
    -- Student already exists - return existing data
    v_siswa_id := v_existing_siswa_id;
    
    -- Note: We don't raise error, just reuse existing student
    -- This allows students to rejoin without creating duplicates
  ELSE
    -- Create new student
    INSERT INTO siswa (nama, kelas_id)
    VALUES (v_nama_clean, v_kelas_id)
    RETURNING id INTO v_siswa_id;
  END IF;
  
  -- Return student & class info
  RETURN QUERY
  SELECT 
    s.id AS siswa_id,
    s.kelas_id AS kelas_id,
    s.nama AS nama_siswa,
    k.kode_kelas AS kode_kelas,
    k.nama_kelas AS nama_kelas
  FROM siswa s
  JOIN kelas k ON s.kelas_id = k.id
  WHERE s.id = v_siswa_id;
END;
$$;

GRANT EXECUTE ON FUNCTION join_class(TEXT, TEXT) TO anon, authenticated;

SELECT '✅ FIX #2: Duplicate students prevented (case-insensitive)! Test joining with same name.' AS result;
