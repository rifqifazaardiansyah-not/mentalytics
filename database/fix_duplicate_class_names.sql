-- FIX #1: Prevent duplicate class names by same teacher
-- A teacher should not be able to create multiple classes with the same name

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
    -- Step 1: Get teacher name
    SELECT nama INTO v_guru_nama FROM guru WHERE id = p_guru_id;
    
    IF v_guru_nama IS NULL THEN
        RAISE EXCEPTION 'Guru tidak ditemukan';
    END IF;
    
    -- Step 2: Check if teacher already has a class with this exact name
    SELECT EXISTS (
        SELECT 1 
        FROM kelas k
        WHERE k.created_by_guru_id = p_guru_id
          AND LOWER(TRIM(k.nama_kelas)) = LOWER(TRIM(p_nama_kelas))
          AND k.status = 'aktif'
    ) INTO v_existing_class;
    
    IF v_existing_class THEN
        RAISE EXCEPTION 'Anda sudah memiliki kelas dengan nama "%". Gunakan nama yang berbeda.', p_nama_kelas;
    END IF;
    
    -- Step 3: Generate kode
    v_kode := generate_kode_kelas();
    
    -- Step 4: Insert kelas
    INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING kelas.id INTO v_kelas_id;
    
    -- Step 5: Link guru to kelas
    IF NOT EXISTS (
        SELECT 1 FROM guru_kelas 
        WHERE guru_kelas.guru_id = p_guru_id 
          AND guru_kelas.kelas_id = v_kelas_id
    ) THEN
        INSERT INTO guru_kelas (guru_id, kelas_id, role)
        VALUES (p_guru_id, v_kelas_id, 'pengajar');
    END IF;
    
    -- Step 6: Return data
    RETURN QUERY SELECT v_kelas_id, v_kode, p_nama_kelas, p_tahun_ajaran;
END;
$$;

GRANT EXECUTE ON FUNCTION create_class_by_teacher(UUID, TEXT, TEXT) TO anon, authenticated;

SELECT '✅ FIX #1: Duplicate class names prevented! Test creating class with same name.' AS result;
