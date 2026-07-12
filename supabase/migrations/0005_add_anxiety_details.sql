-- Add table for anxiety detailed answers (with symptom checkboxes)
create table if not exists anxiety_answers_detail (
  id uuid primary key default uuid_generate_v4(),
  siswa_id uuid references siswa(id) on delete cascade,
  category_no int not null, -- 1-14
  symptoms_checked text[] not null, -- Array of checked symptom texts
  emoticon_score int check (emoticon_score between 0 and 4) not null,
  created_at timestamptz default now()
);

-- RLS policy
alter table anxiety_answers_detail enable row level security;
create policy "public_all_aad" on anxiety_answers_detail for all using (true) with check (true);

-- Index untuk performa
create index idx_anxiety_answers_siswa on anxiety_answers_detail(siswa_id);
create index idx_survey_results_siswa on survey_results(siswa_id);
