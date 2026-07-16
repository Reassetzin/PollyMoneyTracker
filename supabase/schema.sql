-- PollyMoney / Magic Touch finance tracker
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- No login is used, so this schema allows the app's public key full access
-- to these tables. That's fine for a private single-user tool, but do not
-- reuse this pattern for anything with sensitive multi-user data.

create extension if not exists pgcrypto;

create table if not exists settings (
  id int primary key default 1,
  business_name text not null default 'Magic Touch',
  starting_balance numeric not null default 0,
  starting_cash numeric not null default 0,
  currency text not null default '$',
  lang text not null default 'en',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric not null,
  due_day int not null check (due_day between 1 and 31),
  scope text not null check (scope in ('business','personal')),
  last_paid_month text,
  paid_on timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target numeric not null,
  current numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('in','out')),
  amount numeric not null,
  category text not null,
  scope text not null check (scope in ('business','personal')),
  method text not null check (method in ('card','cash','venmo','zelle')),
  note text default '',
  bill_id uuid references bills(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_occurred_at on transactions (occurred_at desc);

-- RLS stays on, but policies allow the app's public (anon) key to read/write
-- freely, since there is no login to check against.
alter table settings enable row level security;
alter table bills enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;

create policy "public read settings" on settings for select using (true);
create policy "public write settings" on settings for update using (true);

create policy "public read bills" on bills for select using (true);
create policy "public write bills" on bills for insert with check (true);
create policy "public update bills" on bills for update using (true);
create policy "public delete bills" on bills for delete using (true);

create policy "public read goals" on goals for select using (true);
create policy "public write goals" on goals for insert with check (true);
create policy "public update goals" on goals for update using (true);
create policy "public delete goals" on goals for delete using (true);

create policy "public read transactions" on transactions for select using (true);
create policy "public write transactions" on transactions for insert with check (true);
create policy "public update transactions" on transactions for update using (true);
create policy "public delete transactions" on transactions for delete using (true);
