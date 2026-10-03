-- Run in the Supabase SQL editor. Public media bucket + admin-only uploads, and public read of site content.
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin upload" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and is_admin());
drop policy if exists "public reads hero" on site_settings;
create policy "public reads settings" on site_settings for select using (true);
