-- 0002_add_multi_class.sql
-- Add multi-class (tenant) support to Mentalytics

-- Tabel kelas (tenant)
create table kelas (
  id uuid primary key default uuid_generate_v4(),
  kode_kelas text unique not null, -- ABC123 - 6 digit alphanumeric
  nama_kelas text not null, -- "Kelas X-1 SMAN 1"
  nama_guru text not null,
  tahun_ajaran text not null, -- "2024/2025"
  status text check (status in ('aktif', 'selesai', 'arsip')) default 'aktif',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index untuk cepat lookup by kode
create index idx_kelas_kode on kelas(kode_kelas);

-- Function untuk generate kode kelas unik
create or replace function generate_kode_kelas()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- exclude 0,O,1,I untuk clarity
  result text := '';
  i int;
begin
  -- Generate 6 character code
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  
  -- Check if exists, if yes regenerate (recursive)
  if exists (select 1 from kelas where kode_kelas = result) then
    return generate_kode_kelas();
  end if;
  
  return result;
end;
$$ language plpgsql;

-- Alter tabel siswa - tambah kelas_id
alter table siswa add column kelas_id uuid references kelas(id) on delete cascade;
create index idx_siswa_kelas on siswa(kelas_id);

-- Update semua tabel untuk filter by kelas
-- Kita akan query siswa.kelas_id untuk filtering, jadi tidak perlu redundant kelas_id di setiap tabel

-- Enable Realtime untuk tabel kelas
alter publication supabase_realtime add table kelas;

-- RLS untuk kelas
alter table kelas enable row level security;
create policy "public_read_kelas" on kelas for select using (true);
create policy "public_insert_kelas" on kelas for insert with check (true);
create policy "public_update_kelas" on kelas for update using (true);

-- Update RLS policies untuk filter by kelas (optional - bisa di-handle di app layer)
-- Untuk prototype, tetap buka semua akses

-- View untuk mempermudah query dengan kelas info
create view v_siswa_with_kelas as
select 
  s.id,
  s.nama,
  s.kelas_id,
  k.kode_kelas,
  k.nama_kelas,
  k.nama_guru,
  k.tahun_ajaran,
  s.created_at
from siswa s
left join kelas k on s.kelas_id = k.id;

-- View untuk essential question answers dengan kelas
create view v_essential_answers_with_kelas as
select 
  e.id,
  e.siswa_id,
  e.jawaban,
  e.created_at,
  s.kelas_id,
  k.kode_kelas,
  k.nama_kelas
from essential_question_answers e
join siswa s on e.siswa_id = s.id
join kelas k on s.kelas_id = k.id;

-- View untuk survey results dengan kelas
create view v_survey_results_with_kelas as
select 
  sr.id,
  sr.siswa_id,
  sr.skor_bullying,
  sr.skor_anxiety,
  sr.waktu_selesai,
  s.kelas_id,
  k.kode_kelas,
  k.nama_kelas
from survey_results sr
join siswa s on sr.siswa_id = s.id
join kelas k on s.kelas_id = k.id;

-- Function untuk membuat kelas baru (untuk guru)
create or replace function create_new_class(
  p_nama_kelas text,
  p_nama_guru text,
  p_tahun_ajaran text
)
returns table (
  id uuid,
  kode_kelas text,
  nama_kelas text,
  nama_guru text,
  tahun_ajaran text
) as $$
declare
  v_kode text;
  v_kelas_id uuid;
begin
  -- Generate unique kode
  v_kode := generate_kode_kelas();
  
  -- Insert kelas baru
  insert into kelas (kode_kelas, nama_kelas, nama_guru, tahun_ajaran)
  values (v_kode, p_nama_kelas, p_nama_guru, p_tahun_ajaran)
  returning kelas.id into v_kelas_id;
  
  -- Return kelas info
  return query
  select 
    k.id,
    k.kode_kelas,
    k.nama_kelas,
    k.nama_guru,
    k.tahun_ajaran
  from kelas k
  where k.id = v_kelas_id;
end;
$$ language plpgsql;

-- Function untuk join kelas (untuk siswa)
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
  -- Cek apakah kelas exists dan aktif
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

-- Stats untuk guru/admin
create view v_class_stats as
select 
  k.id as kelas_id,
  k.kode_kelas,
  k.nama_kelas,
  k.nama_guru,
  count(distinct s.id) as total_siswa,
  count(distinct e.id) as total_essential_answers,
  count(distinct sr.id) as total_survey_completed,
  count(distinct sol.id) as total_solutions_submitted
from kelas k
left join siswa s on s.kelas_id = k.id
left join essential_question_answers e on e.siswa_id = s.id
left join survey_results sr on sr.siswa_id = s.id
left join solutions sol on sol.siswa_id = s.id
group by k.id, k.kode_kelas, k.nama_kelas, k.nama_guru;
