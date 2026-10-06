-- SPERART member experience: web messages + notifications.
-- Run once in Supabase SQL Editor after 010_admin_stability.sql.

create table if not exists member_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users on delete cascade,
  recipient_id uuid not null references auth.users on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists member_messages_recipient_created_idx on member_messages(recipient_id, created_at desc);
create index if not exists member_messages_sender_created_idx on member_messages(sender_id, created_at desc);

alter table member_messages enable row level security;

drop policy if exists "members read own messages" on member_messages;
create policy "members read own messages" on member_messages
  for select using (sender_id = auth.uid() or recipient_id = auth.uid() or is_admin());

drop policy if exists "members send messages" on member_messages;
create policy "members send messages" on member_messages
  for insert with check (sender_id = auth.uid() or is_admin());

drop policy if exists "members mark own messages read" on member_messages;
create policy "members mark own messages read" on member_messages
  for update using (recipient_id = auth.uid() or is_admin())
  with check (recipient_id = auth.uid() or is_admin());

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'message',
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_created_idx on notifications(user_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "members read own notifications" on notifications;
create policy "members read own notifications" on notifications
  for select using (user_id = auth.uid() or is_admin());

drop policy if exists "admins create notifications" on notifications;
create policy "admins create notifications" on notifications
  for insert with check (is_admin());

drop policy if exists "members mark notifications read" on notifications;
create policy "members mark notifications read" on notifications
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

grant select, insert, update on member_messages to authenticated;
grant select, update on notifications to authenticated;

drop policy if exists "members notify admins" on notifications;
create policy "members notify admins" on notifications
  for insert with check (is_admin() or exists (select 1 from admins a where a.user_id = notifications.user_id));
