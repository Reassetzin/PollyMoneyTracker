# Magic Touch Finances (PollyMoney)

Next.js 14 + Supabase finance tracker for Magic Touch.

## One-time setup

1. **Database** — In Supabase: SQL Editor -> New query -> paste the contents of
   `supabase/schema.sql` -> Run. This creates all tables and security rules.

2. **Create your mom's login** — Supabase Dashboard -> Authentication -> Users ->
   Add user. Set her email + a password (turn off "auto confirm" if you want her
   to verify by email, or leave it on so it's ready immediately). There's no
   public sign-up page in this app on purpose — only accounts you create in
   Supabase can log in.

3. **Environment variables** — Already set in `.env.local` for local dev
   (git-ignored, not pushed). Add the same two values in Vercel:
   Project Settings -> Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Connect Vercel to GitHub** — Vercel -> Add New -> Project -> Import
   `Reassetzin/PollyMoneyTracker`. Framework preset: Next.js (auto-detected).
   Auto-deploy on push is on by default — every push to `main` redeploys.

5. **Install to homescreen** — open the deployed URL on her phone -> Share ->
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

All four tables are shared (not per-user) — any account you create in
Supabase Auth can see and edit the same data, since this is a private
two-person family app rather than a multi-tenant product.
