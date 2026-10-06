-- SPERART admin stability patch.
-- Run this once in Supabase SQL Editor after the existing migrations.

-- Keep the explicit RPC, but make its inputs defensive and ensure admins can
-- read/update member status through the authenticated admin session.
drop policy if exists "admin updates profiles" on profiles;
create policy "admin updates profiles" on profiles
  for update using (is_admin()) with check (is_admin());

create or replace function set_member_status(uid uuid, new_status text)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
  set status = new_status
  where user_id = uid
    and is_admin()
    and new_status in ('pending','active','inactive');
$$;

grant execute on function set_member_status(uuid, text) to authenticated;
