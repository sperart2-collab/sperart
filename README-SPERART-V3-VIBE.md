# SPERART 2.0 — V3 Vibe Upgrade

This is a targeted visual/product patch built from the latest SPERART AI + Academy V2.

## What this adds
- Premium dark-navy / gold Academy experience inspired by the supplied SPERART design direction.
- Drum Academy hero, learning-track cards, curriculum pathways and practice-room section.
- Consistent SPERART drum emblem treatment for AI surfaces and admin navigation.
- Premium Command Centre sidebar with icon navigation and stronger product hierarchy.
- Keeps the existing AI actions, messaging, notifications and database logic intact.

## Apply
Replace only the files included in this patch in your current project. Do not replace .env.local or unrelated newer files.

Then run:

```powershell
npm run build
git add .
git commit -m "Upgrade SPERART 2.0 visual experience"
git push
```

No new SQL migration is required for this visual patch. The Academy SQL from V2 remains required if it has not already been run.
