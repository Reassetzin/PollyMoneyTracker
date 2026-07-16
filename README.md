# Magic Touch Finances (PollyMoney)

Next.js 14 + Supabase finance tracker for Magic Touch. No login — this is a
private single-user app. Anyone with the URL can open and use it, so treat
the link like you would a shared document link.

## One-time setup

1. **Database** — In Supabase: SQL Editor -> New query -> paste the contents
   of `supabase/schema.sql` -> Run. This creates all tables.

2. **Environment variables** — Already set in `.env.local` for local dev
   (git-ignored, not pushed). Add the same two values in Vercel:
   Project Settings -> Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Connect Vercel to GitHub** — Vercel -> Add New -> Project -> Import
   `Reassetzin/PollyMoneyTracker`. Framework preset: Next.js (auto-detected).
   Auto-deploy on push is on by default — every push to `main` redeploys.

4. **Install to homescreen** — open the deployed URL on her phone -> Share ->
   Add to Home Screen.

## Local development

```
npm install
npm run dev
```

## Data model

- `settings` — single row, business name, starting bank balance, starting
  cash, currency, language.
- `transactions` — every money in/out entry: type, amount, category, scope
  (business/personal), method (card/cash/venmo/zelle), note, date.
- `bills` — recurring bills with due day, scope, and paid status for the
  current month.
- `goals` — savings goals with a target and running total.

All tables are open to the app's public (anon) key — there's no per-user
auth, since this is a private tool for one person.
