-- 0001_init.sql
-- Mentalytics Database Schema

create extension if not exists "uuid-ossp";

-- Tabel siswa
create table siswa (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  created_at timestamptz default now()
);

-- Tabel jawaban Essential Question
create table essential_question_answers (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  jawaban text not null,
  created_at timestamptz default now()
);

-- Tabel jawaban survei mentah (opsional, untuk debug)
create table survey_answers_raw (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  tipe text check (tipe in ('bullying', 'anxiety')) not null,
  no_pertanyaan int not null,
  skor int check (skor between 1 and 5) not null,
  created_at timestamptz default now()
);

-- Tabel hasil survei (skor total per siswa)
create table survey_results (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade unique,
  skor_bullying int not null,
  skor_anxiety int not null,
  waktu_selesai timestamptz default now()
);

-- Tabel jawaban Guiding Question
create table guiding_question_answers (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  no_pertanyaan int not null,
  jawaban text not null,
  created_at timestamptz default now()
);

-- Tabel solutions (diagram pencar & rekomendasi)
create table solutions (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade unique,
  pola_hubungan text check (pola_hubungan in ('positif', 'negatif', 'tidak ada')),
  siswa_perlu_perhatian text,
  rekomendasi text,
  ai_feedback text,
  created_at timestamptz default now()
);

-- Tabel log interaksi AI
create table ai_interactions (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  halaman text check (halaman in ('guiding_resource', 'solution', 'hasil_tes')),
  prompt text,
  response text,
  created_at timestamptz default now()
);

-- Enable Realtime untuk Forum Diskusi
alter publication supabase_realtime add table essential_question_answers;

-- RLS: prototype tanpa auth, buka akses insert/select publik
-- ⚠️ JANGAN dipakai di production
alter table siswa enable row level security;
create policy "public_all_siswa" on siswa for all using (true) with check (true);

alter table essential_question_answers enable row level security;
create policy "public_all_eqa" on essential_question_answers for all using (true) with check (true);

alter table survey_answers_raw enable row level security;
create policy "public_all_sar" on survey_answers_raw for all using (true) with check (true);

alter table survey_results enable row level security;
create policy "public_all_sr" on survey_results for all using (true) with check (true);

alter table guiding_question_answers enable row level security;
create policy "public_all_gqa" on guiding_question_answers for all using (true) with check (true);

alter table solutions enable row level security;
create policy "public_all_sol" on solutions for all using (true) with check (true);

alter table ai_interactions enable row level security;
create policy "public_all_ai" on ai_interactions for all using (true) with check (true);
