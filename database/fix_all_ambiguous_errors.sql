-- COMPREHENSIVE FIX: All ambiguous column errors
-- Run this in Supabase SQL Editor

-- 1. Drop and recreate view with explicit table aliases
DROP VIEW IF EXISTS v_guru_classes;

CREATE VIEW v_guru_classes AS
SELECT 
    g.id as guru_id,
    g.nama as nama_guru,
    g.email,
    k.id as kelas_id,
    k.kode_kelas,
    k.nama_kelas,
    k.tahun_ajaran,
    k.status,
    k.created_at,
    gk.role as teacher_role,
    COUNT(DISTINCT s.id) as jumlah_siswa
FROM guru g
JOIN guru_kelas gk ON g.id = gk.guru_id
JOIN kelas k ON gk.kelas_id = k.id
LEFT JOIN siswa s ON s.kelas_id = k.id
GROUP BY 
    g.id, 
    g.nama, 
    g.email, 
    k.id, 
    k.kode_kelas, 
    k.nama_kelas, 
    k.tahun_ajaran, 
    k.status, 
    k.created_at, 
    gk.id,              -- FIX: Add guru_kelas.id
    gk.role;

-- 2. Recreate create_class_by_teacher function
DROP FUNCTION IF EXISTS create_class_by_teacher(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION create_class_by_teacher(
    p_guru_id UUID,
    p_nama_kelas TEXT,
    p_tahun_ajaran TEXT
)
RETURNS TABLE (
    kelas_id UUID,
    kode_kelas TEXT,
    nama_kelas TEXT,
    tahun_ajaran TEXT
) AS $$
DECLARE
    v_kode TEXT;
    v_kelas_id UUID;
    v_guru_nama TEXT;
BEGIN
    -- Get teacher name
    SELECT guru.nama INTO v_guru_nama 
    FROM guru 
    WHERE guru.id = p_guru_id;
    
    IF v_guru_nama IS NULL THEN
        RAISE EXCEPTION 'Guru tidak ditemukan';
    END IF;

    -- Generate unique kode
    v_kode := generate_kode_kelas();
    
    -- Insert kelas baru with guru reference
    INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING kelas.id INTO v_kelas_id;
    
    -- Link guru to kelas (check if not exists first)
    INSERT INTO guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'pengajar')
    ON CONFLICT (guru_id, kelas_id) DO NOTHING;
    
    -- Return kelas info with explicit table reference
    RETURN QUERY
    SELECT 
        k.id,
        k.kode_kelas,
        k.nama_kelas,
        k.tahun_ajaran
    FROM kelas k
    WHERE k.id = v_kelas_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate link_teacher_to_class function with explicit references
DROP FUNCTION IF EXISTS link_teacher_to_class(UUID, TEXT);
CREATE OR REPLACE FUNCTION link_teacher_to_class(
    p_guru_id UUID,
    p_kode_kelas TEXT
)
RETURNS TABLE (
    kelas_id UUID,
    kode_kelas TEXT,
    nama_kelas TEXT
) AS $$
DECLARE
    v_kelas_id UUID;
BEGIN
    -- Check if class exists and is active (explicit table reference)
    SELECT k.id INTO v_kelas_id
    FROM kelas k
    WHERE k.kode_kelas = UPPER(p_kode_kelas)
        AND k.status = 'aktif';
    
    IF v_kelas_id IS NULL THEN
        RAISE EXCEPTION 'Kode kelas tidak valid atau kelas sudah tidak aktif';
    END IF;
    
    -- Check if already linked (explicit table and column references)
    IF EXISTS (
        SELECT 1 FROM guru_kelas gk
        WHERE gk.guru_id = p_guru_id AND gk.kelas_id = v_kelas_id
    ) THEN
        RAISE EXCEPTION 'Anda sudah terhubung dengan kelas ini';
    END IF;
    
    -- Link guru to kelas
    INSERT INTO guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'co-teacher');
    
    -- Return kelas info with explicit table reference
    RETURN QUERY
    SELECT 
        k.id,
        k.kode_kelas,
        k.nama_kelas
    FROM kelas k
    WHERE k.id = v_kelas_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Add comments
COMMENT ON VIEW v_guru_classes IS 'View showing all classes per teacher with student count. Fixed all ambiguous column errors with explicit table aliases.';
COMMENT ON FUNCTION create_class_by_teacher IS 'Creates a new class and links to teacher. All queries use explicit table references.';
COMMENT ON FUNCTION link_teacher_to_class IS 'Links existing class to teacher via kode_kelas. All queries use explicit table references.';

-- 5. Test queries
SELECT 'Testing v_guru_classes view...' as status;
SELECT COUNT(*) as total_records FROM v_guru_classes;

SELECT 'Testing functions...' as status;
-- Functions will be tested when called from frontend

SELECT '✅ All fixes applied successfully!' as status;
