-- 0003_fix_join_class_function.sql
-- Fix ambiguous column reference in join_class function

-- Drop old function
drop function if exists join_class(text, text);

-- Recreate with table aliases
create or replace function join_class(
  p_kode_kelas text,
  p_nama_siswa text
)
returns table (
  siswa_id uuid,
  kelas_id uuid,
  nama_siswa text,
  kode_kelas text,
  nama_kelas text
) as $$
declare
  v_kelas_id uuid;
  v_siswa_id uuid;
begin
  -- Cek apakah kelas exists dan aktif (with table alias)
  select k.id into v_kelas_id
  from kelas k
  where k.kode_kelas = upper(p_kode_kelas)
    and k.status = 'aktif';
  
  if v_kelas_id is null then
    raise exception 'Kode kelas tidak valid atau kelas sudah tidak aktif';
  end if;
  
  -- Create siswa baru
  insert into siswa (nama, kelas_id)
  values (p_nama_siswa, v_kelas_id)
  returning id into v_siswa_id;
  
  -- Return siswa & kelas info
  return query
  select 
    s.id as siswa_id,
    s.kelas_id,
    s.nama as nama_siswa,
    k.kode_kelas,
    k.nama_kelas
  from siswa s
  join kelas k on s.kelas_id = k.id
  where s.id = v_siswa_id;
end;
$$ language plpgsql;
