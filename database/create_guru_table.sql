-- Create table for teachers (guru)
CREATE TABLE IF NOT EXISTS public.guru (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Note: In production, use proper hashing (bcrypt, argon2, etc.)
    sekolah TEXT NOT NULL,
    nip TEXT, -- Optional, National ID for teachers
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for guru-kelas relationship (many-to-many)
-- Satu guru bisa mengajar banyak kelas, satu kelas bisa diajar banyak guru (co-teacher)
CREATE TABLE IF NOT EXISTS public.guru_kelas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guru_id UUID NOT NULL REFERENCES public.guru(id) ON DELETE CASCADE,
    kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'pengajar' CHECK (role IN ('pengajar', 'co-teacher', 'observer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guru_id, kelas_id) -- Prevent duplicate assignments
);

-- Update kelas table to track who created it
ALTER TABLE public.kelas ADD COLUMN IF NOT EXISTS created_by_guru_id UUID REFERENCES public.guru(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guru_email ON public.guru(email);
CREATE INDEX IF NOT EXISTS idx_guru_kelas_guru ON public.guru_kelas(guru_id);
CREATE INDEX IF NOT EXISTS idx_guru_kelas_kelas ON public.guru_kelas(kelas_id);
CREATE INDEX IF NOT EXISTS idx_kelas_created_by ON public.kelas(created_by_guru_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru_kelas ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (register)
CREATE POLICY "Allow public registration" ON public.guru
    FOR INSERT
    WITH CHECK (true);

-- Policy: Teachers can read their own data
CREATE POLICY "Teachers can read own data" ON public.guru
    FOR SELECT
    USING (true); -- For now, allow reading for login verification

-- Policy: Teachers can update their own data
CREATE POLICY "Teachers can update own data" ON public.guru
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Allow public read for guru_kelas (needed for dashboard)
CREATE POLICY "Public read guru_kelas" ON public.guru_kelas
    FOR SELECT
    USING (true);

-- Policy: Allow public insert for guru_kelas (when creating/joining class)
CREATE POLICY "Public insert guru_kelas" ON public.guru_kelas
    FOR INSERT
    WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guru_updated_at
    BEFORE UPDATE ON public.guru
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View: Get all classes for a specific teacher
CREATE OR REPLACE VIEW v_guru_classes AS
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
GROUP BY g.id, g.nama, g.email, k.id, k.kode_kelas, k.nama_kelas, k.tahun_ajaran, k.status, k.created_at, gk.role;

-- Function: Create class by teacher (updated)
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
    SELECT nama INTO v_guru_nama FROM guru WHERE id = p_guru_id;
    
    IF v_guru_nama IS NULL THEN
        RAISE EXCEPTION 'Guru tidak ditemukan';
    END IF;

    -- Generate unique kode
    v_kode := generate_kode_kelas();
    
    -- Insert kelas baru with guru reference
    INSERT INTO kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING id INTO v_kelas_id;
    
    -- Link guru to kelas
    INSERT INTO guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'pengajar');
    
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

-- Function: Link existing class to teacher via kode_kelas
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
    
    -- Check if already linked
    IF EXISTS (
        SELECT 1 FROM guru_kelas 
        WHERE guru_id = p_guru_id AND kelas_id = v_kelas_id
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

-- Insert sample teacher for testing (password: "password123")
-- NOTE: In production, hash this password properly!
INSERT INTO public.guru (nama, email, password, sekolah, nip)
VALUES 
    ('Budi Santoso, S.Pd', 'budi.santoso@sman1.sch.id', 'password123', 'SMAN 1 Jakarta', '198012345678901234'),
    ('Siti Rahayu, M.Pd', 'siti.rahayu@sman1.sch.id', 'password123', 'SMAN 1 Jakarta', '198512345678901235')
ON CONFLICT (email) DO NOTHING;

-- Create sample class and link to teacher
DO $$
DECLARE
    v_guru_id UUID;
    v_kelas_result RECORD;
BEGIN
    -- Get Budi's ID
    SELECT id INTO v_guru_id FROM guru WHERE email = 'budi.santoso@sman1.sch.id';
    
    IF v_guru_id IS NOT NULL THEN
        -- Create sample class
        SELECT * INTO v_kelas_result 
        FROM create_class_by_teacher(
            v_guru_id,
            'Kelas X-1 SMAN 1 Jakarta',
            '2024/2025'
        );
        
        RAISE NOTICE 'Sample class created: % (Kode: %)', v_kelas_result.nama_kelas, v_kelas_result.kode_kelas;
    END IF;
END $$;

-- Comments
COMMENT ON TABLE public.guru IS 'Table storing teacher (guru) accounts for the dashboard';
COMMENT ON TABLE public.guru_kelas IS 'Junction table linking teachers to their classes (many-to-many)';
COMMENT ON COLUMN public.guru.password IS 'IMPORTANT: In production, this should be hashed using bcrypt or argon2!';
COMMENT ON VIEW v_guru_classes IS 'View showing all classes assigned to each teacher with student count';
COMMENT ON FUNCTION create_class_by_teacher IS 'Creates a new class and automatically links it to the teacher';
COMMENT ON FUNCTION link_teacher_to_class IS 'Links an existing class to a teacher via kode_kelas (for co-teachers)';

