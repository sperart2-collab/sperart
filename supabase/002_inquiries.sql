-- Run in the Supabase SQL editor. Messages sent to the admin through Spar or the contact form.
create table inquiries (id uuid primary key default gen_random_uuid(), name text not null, email text not null, message text not null,
  status text not null default 'new' check (status in ('new','handled')), created_at timestamptz default now());
alter table inquiries enable row level security;
create policy "anyone can send" on inquiries for insert with check (true);
create policy "admin reads" on inquiries for select using (is_admin());
create policy "admin updates" on inquiries for update using (is_admin());
