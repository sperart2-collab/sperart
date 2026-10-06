# SPERART AI + Academy Upgrade V2

This is a targeted patch for the current SPERART build.

## What it fixes
- Prevents the admin AI from displaying raw JSON/code-like replies.
- Makes model parsing tolerant of JSON wrapped in markdown or followed by punctuation.
- Keeps the internal action JSON (needed for safe execution) hidden from the admin.
- Makes lesson generation produce complete teaching material instead of placeholder fields.
- Gives the admin AI, member AI and public Spar AI the same SPERART drum emblem.
- Replaces the wrong favicon with the SPERART drum emblem.
- Adds a starter Academy curriculum covering beginner, intermediate and advanced work, rudiments, djembe, talking-drum/gongo study, cross-rhythm, ensemble leadership and improvisation.
- Removes the visible homepage "Lessons coming soon" placeholder.
- Replaces default site placeholder copy with polished SPERART mission, vision, story and FAQ defaults.

## SQL
Run `supabase/012_academy_curriculum.sql` once in Supabase.
It uses `ON CONFLICT DO NOTHING`, so existing lessons with the same slug are not overwritten.

## Important
Do not replace `.env.local`.
Do not replace unrelated files from your newer project with old files from an older archive.
Replace only the files included here, then run `npm run build`.
