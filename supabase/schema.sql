-- PollyMoney / Magic Touch finance tracker
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

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

alter table settings enable row level security;
alter table bills enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;

create policy "authenticated read settings" on settings for select using (auth.role() = 'authenticated');
create policy "authenticated write settings" on settings for update using (auth.role() = 'authenticated');

create policy "authenticated read bills" on bills for select using (auth.role() = 'authenticated');
create policy "authenticated write bills" on bills for insert with check (auth.role() = 'authenticated');
create policy "authenticated update bills" on bills for update using (auth.role() = 'authenticated');
create policy "authenticated delete bills" on bills for delete using (auth.role() = 'authenticated');

create policy "authenticated read goals" on goals for select using (auth.role() = 'authenticated');
create policy "authenticated write goals" on goals for insert with check (auth.role() = 'authenticated');
create policy "authenticated update goals" on goals for update using (auth.role() = 'authenticated');
create policy "authenticated delete goals" on goals for delete using (auth.role() = 'authenticated');

create policy "authenticated read transactions" on transactions for select using (auth.role() = 'authenticated');
create policy "authenticated write transactions" on transactions for insert with check (auth.role() = 'authenticated');
create policy "authenticated update transactions" on transactions for update using (auth.role() = 'authenticated');
create policy "authenticated delete transactions" on transactions for delete using (auth.role() = 'authenticated');
