-- ==========================================
-- FINAL FIX FOR AMBIGUOUS COLUMN ERROR
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- STEP 1: Drop EVERYTHING related to guru system
DROP VIEW IF EXISTS v_guru_classes CASCADE;
DROP FUNCTION IF EXISTS create_class_by_teacher(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS link_teacher_to_class(UUID, TEXT) CASCADE;

SELECT '✅ Step 1: Dropped old view and functions' AS status;

-- STEP 2: Recreate VIEW with explicit aliases
CREATE VIEW v_guru_classes AS
SELECT 
    g.id AS guru_id,
    g.nama AS nama_guru,
    g.email AS email,
    k.id AS kelas_id,
    k.kode_kelas AS kode_kelas,
    k.nama_kelas AS nama_kelas,
    k.tahun_ajaran AS tahun_ajaran,
    k.status AS status,
    k.created_at AS created_at,
    gk.role AS teacher_role,
    COALESCE(COUNT(DISTINCT s.id), 0) AS jumlah_siswa
FROM public.guru AS g
INNER JOIN public.guru_kelas AS gk ON g.id = gk.guru_id
INNER JOIN public.kelas AS k ON gk.kelas_id = k.id
LEFT JOIN public.siswa AS s ON s.kelas_id = k.id
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
    gk.id,
    gk.role;

SELECT '✅ Step 2: Created view v_guru_classes' AS status;

-- STEP 3: Recreate create_class_by_teacher function
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
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_kode TEXT;
    v_kelas_id UUID;
    v_guru_nama TEXT;
BEGIN
    -- Get teacher name with explicit table reference
    SELECT guru.nama INTO STRICT v_guru_nama 
    FROM public.guru 
    WHERE guru.id = p_guru_id;
    
    -- Generate unique kode
    v_kode := generate_kode_kelas();
    
    -- Insert new class
    INSERT INTO public.kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING kelas.id INTO v_kelas_id;
    
    -- Link teacher to class
    INSERT INTO public.guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'pengajar')
    ON CONFLICT (guru_id, kelas_id) DO NOTHING;
    
    -- Return class info
    RETURN QUERY
    SELECT 
        k.id AS kelas_id,
        k.kode_kelas AS kode_kelas,
        k.nama_kelas AS nama_kelas,
        k.tahun_ajaran AS tahun_ajaran
    FROM public.kelas AS k
    WHERE k.id = v_kelas_id;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE EXCEPTION 'Guru dengan ID % tidak ditemukan', p_guru_id;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating class: %', SQLERRM;
END;
$$;

SELECT '✅ Step 3: Created function create_class_by_teacher' AS status;

-- STEP 4: Recreate link_teacher_to_class function
CREATE OR REPLACE FUNCTION link_teacher_to_class(
    p_guru_id UUID,
    p_kode_kelas TEXT
)
RETURNS TABLE (
    kelas_id UUID,
    kode_kelas TEXT,
    nama_kelas TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_kelas_id UUID;
    v_already_linked BOOLEAN;
BEGIN
    -- Find class by code
    SELECT k.id INTO v_kelas_id
    FROM public.kelas AS k
    WHERE k.kode_kelas = UPPER(p_kode_kelas)
        AND k.status = 'aktif';
    
    IF v_kelas_id IS NULL THEN
        RAISE EXCEPTION 'Kode kelas "%" tidak valid atau kelas tidak aktif', p_kode_kelas;
    END IF;
    
    -- Check if already linked using explicit subquery
    SELECT EXISTS (
        SELECT 1 
        FROM public.guru_kelas AS gk
        WHERE gk.guru_id = p_guru_id 
          AND gk.kelas_id = v_kelas_id
    ) INTO v_already_linked;
    
    IF v_already_linked THEN
        RAISE EXCEPTION 'Anda sudah terhubung dengan kelas ini';
    END IF;
    
    -- Link teacher to class
    INSERT INTO public.guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'co-teacher');
    
    -- Return class info
    RETURN QUERY
    SELECT 
        k.id AS kelas_id,
        k.kode_kelas AS kode_kelas,
        k.nama_kelas AS nama_kelas
    FROM public.kelas AS k
    WHERE k.id = v_kelas_id;
    
END;
$$;

SELECT '✅ Step 4: Created function link_teacher_to_class' AS status;

-- STEP 5: Grant permissions
GRANT SELECT ON v_guru_classes TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_class_by_teacher(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION link_teacher_to_class(UUID, TEXT) TO anon, authenticated;

SELECT '✅ Step 5: Granted permissions' AS status;

-- STEP 6: Test the view
SELECT '=== Testing v_guru_classes view ===' AS test;
SELECT COUNT(*) AS total_records FROM v_guru_classes;
SELECT * FROM v_guru_classes LIMIT 3;

-- FINAL SUCCESS MESSAGE
SELECT '
╔════════════════════════════════════════════╗
║  ✅ ALL FIXES APPLIED SUCCESSFULLY!       ║
║                                            ║
║  Next steps:                               ║
║  1. Refresh your browser (Ctrl+F5)        ║
║  2. Test "Buat Kelas Baru"                ║
║  3. Test "Gabung Kelas Existing"          ║
║                                            ║
║  If error persists, check Supabase logs   ║
╚════════════════════════════════════════════╝
' AS "🎉 FINAL RESULT";
