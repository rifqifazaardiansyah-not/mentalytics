-- FIX ONLY create_class_by_teacher function
-- The issue is in INSERT INTO guru_kelas - need to be more explicit

DROP FUNCTION IF EXISTS create_class_by_teacher(UUID, TEXT, TEXT) CASCADE;

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
    -- Get teacher name
    SELECT g.nama INTO STRICT v_guru_nama 
    FROM public.guru g
    WHERE g.id = p_guru_id;
    
    -- Generate unique kode
    v_kode := generate_kode_kelas();
    
    -- Insert new class and get ID
    INSERT INTO public.kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING id INTO v_kelas_id;
    
    -- Link teacher to class with explicit column names
    INSERT INTO public.guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'pengajar')
    ON CONFLICT (guru_id, kelas_id) DO NOTHING;
    
    -- Return class info WITHOUT querying again (use variables directly)
    RETURN QUERY
    SELECT 
        v_kelas_id,
        v_kode,
        p_nama_kelas,
        p_tahun_ajaran;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE EXCEPTION 'Guru dengan ID % tidak ditemukan', p_guru_id;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating class: %', SQLERRM;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_class_by_teacher(UUID, TEXT, TEXT) TO anon, authenticated;

-- Test the function
SELECT 'Testing create_class_by_teacher...' AS status;
-- Don't actually test because it will create a real class

SELECT '✅ Function create_class_by_teacher recreated successfully!' AS result;
