# SPERART 2.0 — V4 Academy + Dashboard Experience

This is a targeted overlay patch for the SPERART V2 project.

## What this upgrade changes

- Premium midnight-navy / champagne-gold visual system with restrained electric-blue accents.
- Redesigned member dashboard with a stronger hero, stats, member centre, notifications, AI and messaging hierarchy.
- Redesigned admin Command Centre with premium KPI cards, AI attention panel, quick actions and inbox pulse.
- Redesigned Academy catalogue around Nigerian drum traditions and structured learning tracks.
- New `/academy/[slug]` lesson experience with lesson reading, progress bar, practice room and SPERART AI entry point.
- Consistent SPERART emblem branding in AI surfaces.
- Admin AI UI strips JSON/code-fence style responses from what the administrator sees. Structured actions remain internal so AI can still execute them.
- Existing Supabase schema, AI action engine, authentication, messaging and notification logic are preserved.

## Apply

Copy the contents of this patch into the existing SPERART project and replace matching files.
Do NOT replace `.env.local`.
Do NOT rerun SQL if `012_academy_curriculum.sql` has already been applied.

Then:

```powershell
npm run build
git add .
git commit -m "Upgrade SPERART Academy and dashboard experience"
git push
```

If the build reports a project-specific issue, fix that issue before pushing. This patch is intentionally an overlay rather than a full project archive so your existing environment, media and credentials remain untouched.
