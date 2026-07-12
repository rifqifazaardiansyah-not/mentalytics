-- 0007_update_solutions_table.sql
-- Update solutions table to support new Solution page structure

-- Drop old columns that are no longer needed
alter table solutions 
  drop column if exists pola_hubungan,
  drop column if exists siswa_perlu_perhatian,
  drop column if exists ai_feedback;

-- Add new columns for Solution page
alter table solutions
  add column if not exists langkah_aksi text,
  add column if not exists checklist jsonb default '{"diagramCorrect":false,"canExplain":false,"considerLimits":false,"concreteRecommendation":false,"realAction":false}'::jsonb,
  add column if not exists updated_at timestamptz default now();

-- Update the rekomendasi column to allow null (since it's optional initially)
alter table solutions
  alter column rekomendasi drop not null;

-- Create or replace function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update updated_at
drop trigger if exists update_solutions_updated_at on solutions;
create trigger update_solutions_updated_at
  before update on solutions
  for each row
  execute function update_updated_at_column();
