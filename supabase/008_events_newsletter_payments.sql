-- Run in the Supabase SQL editor.
alter table events add column if not exists capacity int;
create function registrations_count(eid uuid) returns int language sql security definer set search_path = public as
$$ select count(*)::int from registrations where event_id = eid $$;
grant execute on function registrations_count to anon, authenticated;
create table subscribers (id uuid primary key default gen_random_uuid(), email text unique not null, created_at timestamptz default now());
alter table subscribers enable row level security;
create policy "anyone subscribes" on subscribers for insert with check (true);
create policy "admin reads subscribers" on subscribers for select using (is_admin());
grant insert on subscribers to anon, authenticated;
create table payments (tx_ref text primary key, user_id uuid references auth.users on delete cascade, tier text, amount numeric, status text not null default 'pending', created_at timestamptz default now());
alter table payments enable row level security;
create policy "admin reads payments" on payments for select using (is_admin());
