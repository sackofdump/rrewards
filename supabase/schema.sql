-- ════════════════════════════════════════════════════════════════════
--  Restaurant Rewards — Supabase schema
--  Run this in Supabase → SQL Editor → New query, then click Run.
-- ════════════════════════════════════════════════════════════════════

-- ── Customer profiles (linked to auth.users) ──────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text not null,
  email            text not null,
  phone            text,
  birthday         date,
  birthday_set     boolean default false,
  referral_code    text unique,
  referred_by      uuid references public.profiles(id),
  tier             text default 'Bronze',
  rewards_balance  numeric default 0,
  lifetime_spend   numeric default 0,
  lifetime_earned  numeric default 0,
  orders_count     integer default 0,
  last_visit       date,
  status           text default 'active',
  member_since     date default current_date,
  created_at       timestamptz default now()
);

-- ── Orders ────────────────────────────────────────────────────────
create table if not exists public.orders (
  id             bigserial primary key,
  user_id        uuid references public.profiles(id) on delete cascade,
  restaurant_id  integer not null,
  items          jsonb not null default '[]',
  subtotal       numeric not null default 0,
  tax            numeric not null default 0,
  total          numeric not null default 0,
  rewards        numeric not null default 0,
  redeemed       numeric not null default 0,
  server         text,
  status         text default 'completed',
  created_at     timestamptz default now()
);
create index if not exists orders_user_idx on public.orders(user_id);

-- ── Notifications ─────────────────────────────────────────────────
create table if not exists public.notifications (
  id          bigserial primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  read        boolean default false,
  created_at  timestamptz default now()
);
create index if not exists notifs_user_idx on public.notifications(user_id);

-- ── Activity log (audit trail) ────────────────────────────────────
create table if not exists public.activity_log (
  id           bigserial primary key,
  actor_id     text,
  actor_name   text,
  actor_role   text,
  action       text,
  target_id    text,
  target_name  text,
  amount       numeric,
  details      jsonb default '{}',
  anomaly      jsonb,
  read         boolean default false,
  read_by_dev  boolean default false,
  created_at   timestamptz default now()
);

-- Safe to run on existing tables: adds the column if you created the
-- log before this change.
alter table public.activity_log add column if not exists read_by_dev boolean default false;
create index if not exists activity_anomaly_idx on public.activity_log((anomaly is not null));

-- ── Staff accounts ────────────────────────────────────────────────
create table if not exists public.staff_accounts (
  id             bigserial primary key,
  name           text not null,
  email          text unique not null,
  password       text not null,
  restaurant_id  integer,
  created_at     timestamptz default now()
);

-- ── Menu items ────────────────────────────────────────────────────
create table if not exists public.menu_items (
  id             bigserial primary key,
  restaurant_id  integer not null,
  name           text not null,
  price          numeric not null,
  category       text,
  description    text,
  available      boolean default true,
  created_at     timestamptz default now()
);
create index if not exists menu_restaurant_idx on public.menu_items(restaurant_id);

-- ── Promotions ────────────────────────────────────────────────────
create table if not exists public.promotions (
  id             bigserial primary key,
  restaurant_id  integer not null,
  title          text not null,
  description    text,
  reward_rate    numeric default 0.03,
  start_date     date,
  end_date       date,
  color          text default 'from-amber-700 to-amber-500',
  active         boolean default true,
  created_at     timestamptz default now()
);

-- ── Favorites ─────────────────────────────────────────────────────
create table if not exists public.favorites (
  id             bigserial primary key,
  user_id        uuid references public.profiles(id) on delete cascade,
  restaurant_id  integer not null,
  name           text not null,
  price          numeric,
  added_at       timestamptz default now()
);
create index if not exists fav_user_idx on public.favorites(user_id);

-- ── Pending transactions (staff → customer handoff) ──────────────
create table if not exists public.pending_transactions (
  id             bigserial primary key,
  customer_id    uuid references public.profiles(id) on delete cascade,
  restaurant_id  integer not null,
  staff_id       text,
  staff_name     text,
  items          jsonb not null default '[]',
  subtotal       numeric not null default 0,
  tax            numeric not null default 0,
  tip            numeric default 0,
  total          numeric default 0,
  redeem_amt     numeric default 0,
  redeem_on      boolean default false,
  earned         numeric default 0,
  signature      text,
  status         text default 'awaiting_customer',
  final_order_id bigint,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table public.pending_transactions enable row level security;
create policy "anyone can select pending_tx" on public.pending_transactions for select using (true);
create policy "anyone can insert pending_tx" on public.pending_transactions for insert with check (true);
create policy "anyone can update pending_tx" on public.pending_transactions for update using (true);
create policy "anyone can delete pending_tx" on public.pending_transactions for delete using (true);

-- ── App settings (single row) ─────────────────────────────────────
create table if not exists public.app_settings (
  id              integer primary key default 1,
  reward_rate     numeric default 0.03,
  tax_rate        numeric default 0.08,
  referral_bonus  numeric default 10,
  birthday_bonus  numeric default 10,
  updated_at      timestamptz default now(),
  constraint app_settings_single_row check (id = 1)
);
insert into public.app_settings (id) values (1)
  on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles       enable row level security;
alter table public.orders         enable row level security;
alter table public.notifications  enable row level security;
alter table public.activity_log   enable row level security;
alter table public.staff_accounts enable row level security;
alter table public.menu_items     enable row level security;
alter table public.promotions     enable row level security;
alter table public.favorites      enable row level security;
alter table public.app_settings   enable row level security;

-- Open policies for demo purposes — any authenticated or anon user can
-- read/write. In production, lock these down to specific roles.
create policy "anyone can select profiles"  on public.profiles  for select using (true);
create policy "anyone can insert profile"   on public.profiles  for insert with check (true);
create policy "anyone can update profile"   on public.profiles  for update using (true);

create policy "anyone can select orders"         on public.orders         for select using (true);
create policy "anyone can insert order"          on public.orders         for insert with check (true);

create policy "anyone can select notifications"  on public.notifications  for select using (true);
create policy "anyone can insert notifications"  on public.notifications  for insert with check (true);
create policy "anyone can update notifications"  on public.notifications  for update using (true);

create policy "anyone can select activity"       on public.activity_log   for select using (true);
create policy "anyone can insert activity"       on public.activity_log   for insert with check (true);
create policy "anyone can update activity"       on public.activity_log   for update using (true);

create policy "anyone can select staff"          on public.staff_accounts for select using (true);
create policy "anyone can insert staff"          on public.staff_accounts for insert with check (true);
create policy "anyone can update staff"          on public.staff_accounts for update using (true);
create policy "anyone can delete staff"          on public.staff_accounts for delete using (true);

create policy "anyone can select menu"           on public.menu_items     for select using (true);
create policy "anyone can insert menu"           on public.menu_items     for insert with check (true);
create policy "anyone can update menu"           on public.menu_items     for update using (true);
create policy "anyone can delete menu"           on public.menu_items     for delete using (true);

create policy "anyone can select promos"         on public.promotions     for select using (true);
create policy "anyone can insert promos"         on public.promotions     for insert with check (true);
create policy "anyone can update promos"         on public.promotions     for update using (true);
create policy "anyone can delete promos"         on public.promotions     for delete using (true);

create policy "anyone can select favorites"      on public.favorites      for select using (true);
create policy "anyone can insert favorites"      on public.favorites      for insert with check (true);
create policy "anyone can delete favorites"      on public.favorites      for delete using (true);

create policy "anyone can select settings"       on public.app_settings   for select using (true);
create policy "anyone can update settings"       on public.app_settings   for update using (true);

-- ════════════════════════════════════════════════════════════════════
--  Atomic profile update — avoids race between back-to-back transactions
-- ════════════════════════════════════════════════════════════════════
create or replace function public.apply_profile_delta(
  p_user_id uuid,
  p_balance_delta numeric,
  p_spend_delta numeric,
  p_earned_delta numeric,
  p_orders_delta integer,
  p_last_visit date
) returns public.profiles as $$
declare
  result public.profiles;
begin
  update public.profiles set
    rewards_balance = greatest(0, coalesce(rewards_balance, 0) + p_balance_delta),
    lifetime_spend  = coalesce(lifetime_spend, 0) + p_spend_delta,
    lifetime_earned = coalesce(lifetime_earned, 0) + p_earned_delta,
    orders_count    = coalesce(orders_count, 0) + p_orders_delta,
    last_visit      = coalesce(p_last_visit, last_visit),
    tier = case
      when coalesce(lifetime_spend, 0) + p_spend_delta >= 1500 then 'Platinum'
      when coalesce(lifetime_spend, 0) + p_spend_delta >= 600  then 'Gold'
      when coalesce(lifetime_spend, 0) + p_spend_delta >= 200  then 'Silver'
      else 'Bronze'
    end
  where id = p_user_id
  returning * into result;
  return result;
end;
$$ language plpgsql security definer;

-- ════════════════════════════════════════════════════════════════════
--  Realtime — enable replication so subscriptions fire
-- ════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table activity_log;
alter publication supabase_realtime add table menu_items;
alter publication supabase_realtime add table pending_transactions;
