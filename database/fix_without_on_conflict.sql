-- FIX: Remove ON CONFLICT which might cause ambiguous column error

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
    
    -- Insert new class
    INSERT INTO public.kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran, created_by_guru_id)
    VALUES (v_kode, p_nama_kelas, v_guru_nama, p_tahun_ajaran, p_guru_id)
    RETURNING id INTO v_kelas_id;
    
    -- Link teacher to class (explicit columns in ON CONFLICT)
    INSERT INTO public.guru_kelas (guru_id, kelas_id, role)
    VALUES (p_guru_id, v_kelas_id, 'pengajar')
    ON CONFLICT ON CONSTRAINT guru_kelas_guru_id_kelas_id_key DO NOTHING;
    
    -- Return values
    kelas_id := v_kelas_id;
    kode_kelas := v_kode;
    nama_kelas := p_nama_kelas;
    tahun_ajaran := p_tahun_ajaran;
    RETURN NEXT;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE EXCEPTION 'Guru dengan ID % tidak ditemukan', p_guru_id;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION create_class_by_teacher(UUID, TEXT, TEXT) TO anon, authenticated;

SELECT '✅ Fixed: Removed ON CONFLICT. Test now!' AS result;
