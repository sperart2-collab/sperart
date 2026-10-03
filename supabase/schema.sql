-- Phase 1 schema. Run in the Supabase SQL editor. Add modules (lessons, events, ...) as new migrations.
create table admins (user_id uuid primary key references auth.users on delete cascade);
create table site_settings (key text primary key, value jsonb not null default '{}', updated_at timestamptz default now());
create table media (id uuid primary key default gen_random_uuid(), kind text not null check (kind in ('image','video','audio','document')),
  bucket text not null, path text not null, title text, created_at timestamptz default now());
create table articles (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, body text,
  status text not null default 'draft' check (status in ('draft','published')), created_at timestamptz default now());
create table ai_conversations (id uuid primary key default gen_random_uuid(), admin_id uuid references auth.users, created_at timestamptz default now());
create table ai_suggestions (id uuid primary key default gen_random_uuid(), conversation_id uuid references ai_conversations,
  kind text not null, summary text not null, payload jsonb not null default '{}', requires_confirmation boolean default true,
  status text not null default 'pending' check (status in ('pending','approved','rejected','executed')), created_at timestamptz default now());

create function is_admin() returns boolean language sql stable security definer as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

alter table admins enable row level security;
alter table site_settings enable row level security;
alter table media enable row level security;
alter table articles enable row level security;
alter table ai_conversations enable row level security;
alter table ai_suggestions enable row level security;

create policy "public reads hero" on site_settings for select using (key = 'hero');
create policy "admin all settings" on site_settings for all using (is_admin()) with check (is_admin());
create policy "public reads published" on articles for select using (status = 'published' or is_admin());
create policy "admin writes articles" on articles for all using (is_admin()) with check (is_admin());
create policy "admin media" on media for all using (is_admin()) with check (is_admin());
create policy "admin conversations" on ai_conversations for all using (is_admin()) with check (is_admin());
create policy "admin suggestions" on ai_suggestions for all using (is_admin()) with check (is_admin());
create policy "admin self-read" on admins for select using (user_id = auth.uid());
-- First admin: after creating the user in Supabase Auth, run: insert into admins values ('<user uuid>');
