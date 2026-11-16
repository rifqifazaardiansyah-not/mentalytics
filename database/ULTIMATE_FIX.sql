-- ULTIMATE FIX: Simplest possible version without any fancy syntax

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
BEGIN
    -- Step 1: Get teacher name
    SELECT nama INTO v_guru_nama FROM guru WHERE id = p_guru_id;
    
    IF v_guru_nama IS NULL THEN
        RAISE EXCEPTION 'Guru tidak ditemukan';
    END IF;
    
    -- Step 2: Generate kode
    v_kode := generate_kode_kelas();
    
    -- Step 3: Insert kelas
    INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING kelas.id INTO v_kelas_id;
    
    -- Step 4: Check if already linked (avoid ON CONFLICT ambiguity)
    IF NOT EXISTS (
        SELECT 1 FROM guru_kelas WHERE guru_kelas.guru_id = p_guru_id AND guru_kelas.kelas_id = v_kelas_id
    ) THEN
        INSERT INTO guru_kelas (guru_id, kelas_id, role)
        VALUES (p_guru_id, v_kelas_id, 'pengajar');
    END IF;
    
    -- Step 5: Return using simple SELECT
    RETURN QUERY SELECT v_kelas_id, v_kode, p_nama_kelas, p_tahun_ajaran;
END;
$$;

GRANT EXECUTE ON FUNCTION create_class_by_teacher(UUID, TEXT, TEXT) TO anon, authenticated;

SELECT '✅ ULTIMATE FIX applied! Test Buat Kelas Baru now!' AS result;
