-- UPDATE SCRIPT: Fix ambiguous column error in v_guru_classes view
-- Safe to run multiple times (idempotent)

-- Drop existing view to recreate
DROP VIEW IF EXISTS v_guru_classes;

-- Recreate view with fixed GROUP BY clause (includes k.created_at AND gk.id)
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
    gk.id,              -- FIX: Add guru_kelas.id to prevent ambiguous column error
    gk.role;

-- Add column to kelas table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'kelas' 
        AND column_name = 'created_by_guru_id'
    ) THEN
        ALTER TABLE public.kelas ADD COLUMN created_by_guru_id UUID REFERENCES public.guru(id);
        CREATE INDEX idx_kelas_created_by ON public.kelas(created_by_guru_id);
    END IF;
END $$;

-- Recreate functions (DROP IF EXISTS is safe)
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
    -- Get teacher name (explicit table reference)
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
    
    -- Return kelas info
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
    -- Check if class exists and is active
    SELECT k.id INTO v_kelas_id
    FROM kelas k
    WHERE k.kode_kelas = UPPER(p_kode_kelas)
        AND k.status = 'aktif';
    
    IF v_kelas_id IS NULL THEN
        RAISE EXCEPTION 'Kode kelas tidak valid atau kelas sudah tidak aktif';
    END IF;
    
    -- Check if already linked (explicit table alias)
    IF EXISTS (
        SELECT 1 FROM guru_kelas gk
        WHERE gk.guru_id = p_guru_id AND gk.kelas_id = v_kelas_id
    ) THEN
        RAISE EXCEPTION 'Anda sudah terhubung dengan kelas ini';
    END IF;
    
    -- Link guru to kelas
    INSERT INTO guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'co-teacher');
    
    -- Return kelas info
    RETURN QUERY
    SELECT 
        k.id,
        k.kode_kelas,
        k.nama_kelas
    FROM kelas k
    WHERE k.id = v_kelas_id;
END;
$$ LANGUAGE plpgsql;

-- Update comments
COMMENT ON VIEW v_guru_classes IS 'View showing all classes assigned to each teacher with student count (UPDATED: fixed ambiguous column error)';
COMMENT ON FUNCTION create_class_by_teacher IS 'Creates a new class and automatically links it to the teacher';
COMMENT ON FUNCTION link_teacher_to_class IS 'Links an existing class to a teacher via kode_kelas (for co-teachers)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database updated successfully! View v_guru_classes has been recreated with fix for ambiguous column error.';
END $$;
