-- FIX #3: Prevent duplicate class creation in ClassEntry (Student menu)
-- Same guru should not be able to create multiple classes with same name

DROP FUNCTION IF EXISTS create_new_class(TEXT, TEXT, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION create_new_class(
  p_nama_kelas TEXT,
  p_nama_guru TEXT,
  p_tahun_ajaran TEXT
)
RETURNS TABLE (
  id UUID,
  kode_kelas TEXT,
  nama_kelas TEXT,
  nama_guru TEXT,
  tahun_ajaran TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_kode TEXT;
  v_kelas_id UUID;
  v_existing_class BOOLEAN;
  v_nama_kelas_clean TEXT;
  v_nama_guru_clean TEXT;
BEGIN
  -- Clean inputs
  v_nama_kelas_clean := TRIM(p_nama_kelas);
  v_nama_guru_clean := TRIM(p_nama_guru);
  
  IF v_nama_kelas_clean = '' THEN
    RAISE EXCEPTION 'Nama kelas tidak boleh kosong';
  END IF;
  
  IF v_nama_guru_clean = '' THEN
    RAISE EXCEPTION 'Nama guru tidak boleh kosong';
  END IF;
  
  -- Check if same teacher already has class with same name (case-insensitive)
  SELECT EXISTS (
    SELECT 1 
    FROM kelas k
    WHERE LOWER(TRIM(k.nama_guru)) = LOWER(v_nama_guru_clean)
      AND LOWER(TRIM(k.nama_kelas)) = LOWER(v_nama_kelas_clean)
      AND k.status = 'aktif'
  ) INTO v_existing_class;
  
  IF v_existing_class THEN
    RAISE EXCEPTION 'Guru "%" sudah memiliki kelas dengan nama "%". Gunakan nama yang berbeda.', 
      v_nama_guru_clean, v_nama_kelas_clean;
  END IF;
  
  -- Generate unique kode
  v_kode := generate_kode_kelas();
  
  -- Insert new class
  INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran)
  VALUES (v_kode, v_nama_kelas_clean, v_nama_guru_clean, p_tahun_ajaran)
  RETURNING kelas.id INTO v_kelas_id;
  
  -- Return class info
  RETURN QUERY
  SELECT 
    k.id,
    k.kode_kelas,
    k.nama_kelas,
    k.nama_guru,
    k.tahun_ajaran
  FROM kelas k
  WHERE k.id = v_kelas_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_new_class(TEXT, TEXT, TEXT) TO anon, authenticated;

SELECT '✅ FIX #3: Duplicate class creation prevented! Test creating class with same name.' AS result;
