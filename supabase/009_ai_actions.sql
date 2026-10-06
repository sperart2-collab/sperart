-- Run in the Supabase SQL editor. Log of everything the AI assistant does.
create table ai_actions (id uuid primary key default gen_random_uuid(), admin_id uuid, type text, args jsonb, result text, auto boolean default false, created_at timestamptz default now());
alter table ai_actions enable row level security;
create policy "admin all ai_actions" on ai_actions for all using (is_admin()) with check (is_admin());
