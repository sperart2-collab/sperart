-- Run in the Supabase SQL editor.
create table recognitions (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  category text not null default 'Award' check (category in ('Award','Scholarship','Honour','Competition','Featured Artist')),
  year text, summary text, image_url text, status text not null default 'draft' check (status in ('draft','published')), created_at timestamptz default now());
create table resources (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  category text not null default 'Educational resource' check (category in ('Article','Research','Publication','Educational resource','Archive')),
  tags text, summary text, url text, status text not null default 'draft' check (status in ('draft','published')), created_at timestamptz default now());
alter table recognitions enable row level security;
alter table resources enable row level security;
create policy "public reads recognitions" on recognitions for select using (status = 'published' or is_admin());
create policy "admin writes recognitions" on recognitions for all using (is_admin()) with check (is_admin());
create policy "public reads resources" on resources for select using (status = 'published' or is_admin());
create policy "admin writes resources" on resources for all using (is_admin()) with check (is_admin());
