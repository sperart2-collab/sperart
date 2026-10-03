-- Run in the Supabase SQL editor. Academy lessons and rudiments.
create table lessons (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  category text not null default 'Lesson' check (category in ('Lesson','Rudiment')),
  level text not null default 'Beginner' check (level in ('Beginner','Intermediate','Advanced')),
  summary text, video_url text, audio_url text, body text,
  status text not null default 'draft' check (status in ('draft','published')), created_at timestamptz default now());
alter table lessons enable row level security;
create policy "public reads published lessons" on lessons for select using (status = 'published' or is_admin());
create policy "admin writes lessons" on lessons for all using (is_admin()) with check (is_admin());
