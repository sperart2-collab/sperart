-- Run in the Supabase SQL editor. News fields, events, registrations, member profiles.
alter table articles add column if not exists cover_url text, add column if not exists excerpt text;
create table events (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text, location text, cover_url text,
  starts_at timestamptz not null default now(), status text not null default 'draft' check (status in ('draft','published')), created_at timestamptz default now());
create table registrations (id uuid primary key default gen_random_uuid(), event_id uuid not null references events on delete cascade,
  name text not null, email text not null, phone text, created_at timestamptz default now());
create table profiles (user_id uuid primary key references auth.users on delete cascade, email text, full_name text, phone text, membership_type text,
  status text not null default 'pending' check (status in ('pending','active','inactive')), created_at timestamptz default now());
alter table events enable row level security;
alter table registrations enable row level security;
alter table profiles enable row level security;
create policy "public reads published events" on events for select using (status = 'published' or is_admin());
create policy "admin writes events" on events for all using (is_admin()) with check (is_admin());
create policy "anyone registers" on registrations for insert with check (true);
create policy "admin reads registrations" on registrations for select using (is_admin());
create policy "own profile read" on profiles for select using (user_id = auth.uid());
create policy "admin reads profiles" on profiles for select using (is_admin());
create policy "own profile update" on profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Members may edit only these columns; status is changed by admins through set_member_status().
revoke insert, update on profiles from anon, authenticated;
grant update (full_name, phone, membership_type) on profiles to authenticated;
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as
$$ begin insert into profiles (user_id, email) values (new.id, new.email) on conflict do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
insert into profiles (user_id, email) select id, email from auth.users on conflict do nothing;
create function set_member_status(uid uuid, new_status text) returns void language sql security definer set search_path = public as
$$ update profiles set status = new_status where user_id = uid and is_admin() and new_status in ('pending','active','inactive') $$;
grant execute on function set_member_status to authenticated;
