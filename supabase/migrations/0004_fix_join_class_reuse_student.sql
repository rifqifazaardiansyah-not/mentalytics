-- 0004_fix_join_class_reuse_student.sql
-- Fix join_class to reuse existing student if same name in same class

-- Drop old function
drop function if exists join_class(text, text);

-- Recreate with student reuse logic
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
  v_existing_siswa_id uuid;
begin
  -- Cek apakah kelas exists dan aktif
  select k.id into v_kelas_id
  from kelas k
  where k.kode_kelas = upper(p_kode_kelas)
    and k.status = 'aktif';
  
  if v_kelas_id is null then
    raise exception 'Kode kelas tidak valid atau kelas sudah tidak aktif';
  end if;
  
  -- Check if student with same name already exists in this class
  select s.id into v_existing_siswa_id
  from siswa s
  where s.nama = p_nama_siswa
    and s.kelas_id = v_kelas_id;
  
  if v_existing_siswa_id is not null then
    -- Student already exists, reuse it
    v_siswa_id := v_existing_siswa_id;
  else
    -- Create new student
    insert into siswa (nama, kelas_id)
    values (p_nama_siswa, v_kelas_id)
    returning id into v_siswa_id;
  end if;
  
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
