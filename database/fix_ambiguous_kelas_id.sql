-- FIX: Ambiguous column "kelas_id" error in v_guru_classes
-- This happens because both guru_kelas and kelas tables have columns that could be referenced
-- Solution: Use explicit table aliases in GROUP BY

-- Drop and recreate view with fully qualified column names
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
    k.id,               -- Explicitly k.id (kelas primary key)
    k.kode_kelas, 
    k.nama_kelas, 
    k.tahun_ajaran, 
    k.status, 
    k.created_at, 
    gk.id,              -- ADD THIS: guru_kelas row identifier
    gk.role;

COMMENT ON VIEW v_guru_classes IS 'View showing all classes per teacher with student count. Fixed ambiguous column error by adding gk.id to GROUP BY.';

-- Test the view
SELECT * FROM v_guru_classes LIMIT 5;
