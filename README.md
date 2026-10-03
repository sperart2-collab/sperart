# SPERART (sperart.org), Phase 1 foundation
Percussion, rhythm and culture platform. Stack: Next.js 14, TypeScript, Tailwind, Supabase. See `docs/ARCHITECTURE.md`.

## Setup
1. `npm install`
2. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
3. `cp .env.example .env.local` and fill in the values.
4. In Supabase Auth, create your admin user, then run `insert into admins values ('<user uuid>');`
5. Optional hero: `insert into site_settings values ('hero','{"title":"...","subtitle":"...","video_url":"..."}');`
6. `npm run dev`, then build with `npm run build` and `npm start`.
Set the Supabase Auth redirect URL to your site URL for the magic-link login.

## Security
Never put the service role or AI keys in client code or `NEXT_PUBLIC_` variables. Keep RLS enabled.

## Status
Built: layout, design tokens, homepage (hero read from `site_settings`), email-link login, admin gate and overview, AI provider layer, storage layer, schema with RLS.
Not built: media upload UI, article/event/lesson editors, AI chat UI and approval workflow, membership, gallery, contact form, SEO and accessibility passes.
Needs from you: Supabase credentials, AI API key and model name, mission text, logo, hero video, contact details.
