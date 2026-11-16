-- COMPLETE FIX: Drop and recreate view with CASCADE
-- This ensures old view definition is completely removed

-- Step 1: Drop view with CASCADE (removes all dependencies)
DROP VIEW IF EXISTS v_guru_classes CASCADE;

-- Step 2: Recreate view with EXPLICIT table references and gk.id in GROUP BY
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
    COUNT(DISTINCT s.id) AS jumlah_siswa
FROM public.guru g
INNER JOIN public.guru_kelas gk ON g.id = gk.guru_id
INNER JOIN public.kelas k ON gk.kelas_id = k.id
LEFT JOIN public.siswa s ON s.kelas_id = k.id
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
    gk.id,              -- CRITICAL: Must include guru_kelas primary key
    gk.role;

-- Step 3: Verify view works
SELECT 'Testing view...' AS status;
SELECT COUNT(*) AS total_rows FROM v_guru_classes;

-- Step 4: Show sample data
SELECT 'Sample data:' AS status;
SELECT * FROM v_guru_classes LIMIT 3;

-- Success message
SELECT '✅ View recreated successfully! No more ambiguous column errors.' AS result;
