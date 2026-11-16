-- ========================================
-- ALL DUPLICATE PREVENTION FIXES
-- Run this to apply all 3 fixes at once
-- ========================================

-- ========================================
-- FIX #1: Prevent Duplicate Class Names (Teacher Dashboard)
-- ========================================
DROP FUNCTION IF EXISTS create_class_by_teacher(UUID, TEXT, TEXT) CASCADE;

CREATE FUNCTION create_class_by_teacher(
    p_guru_id UUID,
    p_nama_kelas TEXT,
    p_tahun_ajaran TEXT
)
RETURNS TABLE (
    kelas_id UUID,
    kode_kelas TEXT,
    nama_kelas TEXT,
    tahun_ajaran TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_kode TEXT;
    v_kelas_id UUID;
    v_guru_nama TEXT;
    v_existing_class BOOLEAN;
BEGIN
    SELECT nama INTO v_guru_nama FROM guru WHERE id = p_guru_id;
    
    IF v_guru_nama IS NULL THEN
        RAISE EXCEPTION 'Guru tidak ditemukan';
    END IF;
    
    -- Check duplicate
    SELECT EXISTS (
        SELECT 1 FROM kelas k
        WHERE k.created_by_guru_id = p_guru_id
          AND LOWER(TRIM(k.nama_kelas)) = LOWER(TRIM(p_nama_kelas))
          AND k.status = 'aktif'
    ) INTO v_existing_class;
    
    IF v_existing_class THEN
        RAISE EXCEPTION 'Anda sudah memiliki kelas dengan nama "%". Gunakan nama yang berbeda.', p_nama_kelas;
    END IF;
    
    v_kode := generate_kode_kelas();
    
    INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING kelas.id INTO v_kelas_id;
    
    IF NOT EXISTS (
        SELECT 1 FROM guru_kelas 
        WHERE guru_kelas.guru_id = p_guru_id AND guru_kelas.kelas_id = v_kelas_id
    ) THEN
        INSERT INTO guru_kelas (guru_id, kelas_id, role)
        VALUES (p_guru_id, v_kelas_id, 'pengajar');
    END IF;
    
    RETURN QUERY SELECT v_kelas_id, v_kode, p_nama_kelas, p_tahun_ajaran;
END;
$$;

GRANT EXECUTE ON FUNCTION create_class_by_teacher(UUID, TEXT, TEXT) TO anon, authenticated;

SELECT '✅ FIX #1 APPLIED: Teacher duplicate class names prevented' AS status;

-- ========================================
-- FIX #2: Prevent Duplicate Students (Case-Insensitive)
-- ========================================
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
  v_nama_clean := TRIM(p_nama_siswa);
  
  IF v_nama_clean = '' THEN
    RAISE EXCEPTION 'Nama siswa tidak boleh kosong';
  END IF;
  
  SELECT k.id INTO v_kelas_id
  FROM kelas k
  WHERE k.kode_kelas = UPPER(p_kode_kelas) AND k.status = 'aktif';
  
  IF v_kelas_id IS NULL THEN
    RAISE EXCEPTION 'Kode kelas tidak valid atau kelas sudah tidak aktif';
  END IF;
  
  -- Check duplicate (case-insensitive)
  SELECT s.id INTO v_existing_siswa_id
  FROM siswa s
  WHERE LOWER(TRIM(s.nama)) = LOWER(v_nama_clean) AND s.kelas_id = v_kelas_id;
  
  IF v_existing_siswa_id IS NOT NULL THEN
    v_siswa_id := v_existing_siswa_id;
  ELSE
    INSERT INTO siswa (nama, kelas_id)
    VALUES (v_nama_clean, v_kelas_id)
    RETURNING id INTO v_siswa_id;
  END IF;
  
  RETURN QUERY
  SELECT s.id, s.kelas_id, s.nama, k.kode_kelas, k.nama_kelas
  FROM siswa s
  JOIN kelas k ON s.kelas_id = k.id
  WHERE s.id = v_siswa_id;
END;
$$;

GRANT EXECUTE ON FUNCTION join_class(TEXT, TEXT) TO anon, authenticated;

SELECT '✅ FIX #2 APPLIED: Student duplicates prevented (case-insensitive)' AS status;

-- ========================================
-- FIX #3: Prevent Duplicate Class Creation (ClassEntry)
-- ========================================
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
  v_nama_kelas_clean := TRIM(p_nama_kelas);
  v_nama_guru_clean := TRIM(p_nama_guru);
  
  IF v_nama_kelas_clean = '' THEN
    RAISE EXCEPTION 'Nama kelas tidak boleh kosong';
  END IF;
  
  IF v_nama_guru_clean = '' THEN
    RAISE EXCEPTION 'Nama guru tidak boleh kosong';
  END IF;
  
  -- Check duplicate (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM kelas k
    WHERE LOWER(TRIM(k.nama_guru)) = LOWER(v_nama_guru_clean)
      AND LOWER(TRIM(k.nama_kelas)) = LOWER(v_nama_kelas_clean)
      AND k.status = 'aktif'
  ) INTO v_existing_class;
  
  IF v_existing_class THEN
    RAISE EXCEPTION 'Guru "%" sudah memiliki kelas dengan nama "%". Gunakan nama yang berbeda.', 
      v_nama_guru_clean, v_nama_kelas_clean;
  END IF;
  
  v_kode := generate_kode_kelas();
  
  INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran)
  VALUES (v_kode, v_nama_kelas_clean, v_nama_guru_clean, p_tahun_ajaran)
  RETURNING kelas.id INTO v_kelas_id;
  
  RETURN QUERY
  SELECT k.id, k.kode_kelas, k.nama_kelas, k.nama_guru, k.tahun_ajaran
  FROM kelas k
  WHERE k.id = v_kelas_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_new_class(TEXT, TEXT, TEXT) TO anon, authenticated;

SELECT '✅ FIX #3 APPLIED: ClassEntry duplicate class creation prevented' AS status;

-- ========================================
-- FINAL SUCCESS MESSAGE
-- ========================================
SELECT '
╔══════════════════════════════════════════════════╗
║  ✅ ALL 3 DUPLICATE PREVENTION FIXES APPLIED!   ║
║                                                  ║
║  Fix #1: Teacher duplicate class names          ║
║  Fix #2: Student duplicates (case-insensitive)  ║
║  Fix #3: ClassEntry duplicate class creation    ║
║                                                  ║
║  Test each scenario to verify!                  ║
╚══════════════════════════════════════════════════╝
' AS "🎉 SUCCESS";
