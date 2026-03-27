-- Enable RLS
alter table if exists transactions enable row level security;

-- Transactions
create table if not exists transactions (
  id text primary key,
  user_id uuid references auth.users not null,
  type text not null,
  category text not null,
  description text not null,
  amount numeric not null,
  date text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "Users own transactions" on transactions for all using (auth.uid() = user_id);

-- Investments
create table if not exists investments (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  ticker text not null,
  type text not null,
  quantity numeric not null,
  avg_price numeric not null,
  current_price numeric not null,
  notes text default '',
  dividends jsonb default '[]',
  history jsonb default '[]',
  created_at timestamptz default now()
);
alter table investments enable row level security;
create policy "Users own investments" on investments for all using (auth.uid() = user_id);

-- Goals
create table if not exists goals (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null,
  deadline text default '',
  description text default '',
  created_at timestamptz default now()
);
alter table goals enable row level security;
create policy "Users own goals" on goals for all using (auth.uid() = user_id);

-- Watchlist
create table if not exists watchlist (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  ticker text not null,
  type text not null,
  target_price numeric,
  notes text default '',
  added_at text not null
);
alter table watchlist enable row level security;
create policy "Users own watchlist" on watchlist for all using (auth.uid() = user_id);

-- Budgets
create table if not exists budgets (
  id text primary key,
  user_id uuid references auth.users not null,
  category text not null,
  "limit" numeric not null,
  month text not null
);
alter table budgets enable row level security;
create policy "Users own budgets" on budgets for all using (auth.uid() = user_id);

-- Recurring
create table if not exists recurring (
  id text primary key,
  user_id uuid references auth.users not null,
  type text not null,
  category text not null,
  description text not null,
  amount numeric not null,
  day_of_month integer not null,
  active boolean default true
);
alter table recurring enable row level security;
create policy "Users own recurring" on recurring for all using (auth.uid() = user_id);

-- User settings (emergency fund, theme, patrimony)
create table if not exists user_settings (
  user_id uuid primary key references auth.users,
  emergency_target numeric default 0,
  emergency_current numeric default 0,
  theme text default 'dark',
  patrimony jsonb default '[]',
  custom_categories jsonb default '[]'
);
alter table user_settings enable row level security;
create policy "Users own settings" on user_settings for all using (auth.uid() = user_id);
