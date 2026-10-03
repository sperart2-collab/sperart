-- Run in the Supabase SQL editor. Lets the public gallery read the media list (files are already public).
create policy "public reads media" on media for select using (true);
