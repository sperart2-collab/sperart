# Architecture
- Next.js 14 (App Router, TypeScript, Tailwind) + Supabase (Postgres, Auth, Storage).
- `src/lib/ai`: assistant -> service -> provider adapter. Add a provider by adding a file in `providers/` and one line in `service.ts`.
- `src/lib/storage`: `StorageProvider` interface; Supabase is one implementation. Media never lives in git.
- AI safety: the AI only writes rows to `ai_suggestions`. Executing a suggestion must be a separate admin-approved server action (not built yet).
- Security: RLS in `supabase/schema.sql`; `/admin` is gated server-side by session plus the `admins` table. The service role key is server-only.
- New module: add a table + RLS policy in `supabase/`, a folder in `src/features/<module>`, routes in `src/app`.
