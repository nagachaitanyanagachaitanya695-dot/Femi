-- =============================================================================
-- Femi — Supabase schema
--
-- Run this once in the Supabase SQL editor (or `supabase db push`) before
-- pointing the app at a Supabase project.
--
-- Design notes
--  * Row-level security is on for every table. The anon/publishable key can
--    read the public catalogue and nothing else.
--  * The app's server code writes through the service-role key *after* it has
--    checked who the caller is. RLS is the second line of defence, for anything
--    that reaches the database directly from a browser.
--  * Prices live here as integers (whole rupees). The server always recomputes
--    order totals from these rows — never from anything the browser sends.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on sign-up
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  mobile      text not null default '',
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'Authorisation role. Only a database admin (or the service key) may change this.';

-- -----------------------------------------------------------------------------
-- products: the catalogue
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id            text primary key,
  slug          text not null unique,
  name          text not null,
  short         text not null default '',
  description   text not null default '',
  category      text not null check (category in ('everyday', 'heavy-flow', 'overnight', 'value-packs')),
  pad_count     integer not null default 0 check (pad_count >= 0),
  length        text not null default '',
  size          text not null default '',
  packs         integer not null default 1 check (packs >= 1),
  mrp           integer not null check (mrp >= 0),
  price         integer not null check (price >= 0),
  bulk_price    integer check (bulk_price >= 0),
  bulk_min_qty  integer check (bulk_min_qty >= 2),
  features      text[] not null default '{}',
  popularity    integer not null default 50,
  rating        numeric(2,1) not null default 4.5 check (rating >= 0 and rating <= 5),
  review_count  integer not null default 0 check (review_count >= 0),
  stock         integer not null default 0 check (stock >= 0),
  active        boolean not null default true,
  badge         text,
  theme         jsonb not null default '{"base":"#F3B21B","band":"#7FC241","tab":"#1F5132","ink":"#231404"}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint price_not_above_mrp check (price <= mrp),
  constraint bulk_below_price check (bulk_price is null or bulk_price <= price)
);

create index if not exists products_active_idx on public.products (active, popularity desc);
create index if not exists products_category_idx on public.products (category);

-- -----------------------------------------------------------------------------
-- addresses: saved delivery addresses
-- -----------------------------------------------------------------------------
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  label       text default 'Home',
  full_name   text not null,
  mobile      text not null check (mobile ~ '^[6-9][0-9]{9}$'),
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pincode     text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- orders: an order is an immutable record of what was priced at checkout
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique,
  user_id        uuid references auth.users (id) on delete set null,
  status         text not null default 'pending'
                 check (status in ('pending','confirmed','packed','shipped','delivered','cancelled')),
  customer_name  text not null,
  mobile         text not null,
  email          text not null,
  address        jsonb not null,
  notes          text,
  lines          jsonb not null,
  totals         jsonb not null,
  courier        text not null default 'Delhivery',
  tracking_id    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

-- Create the profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, mobile)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'mobile', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is the caller an admin? Used by the policies below.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Atomic stock decrement, called after an order is written.
create or replace function public.decrement_stock(p_product_id text, p_qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set stock = greatest(0, stock - p_qty), updated_at = now()
  where id = p_product_id;
$$;

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row-level security
-- =============================================================================
alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.addresses enable row level security;
alter table public.orders    enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Nobody can promote themselves: role changes are blocked for normal users.
drop policy if exists "profiles: no self promotion" on public.profiles;
create policy "profiles: no self promotion" on public.profiles
  as restrictive for update using (
    public.is_admin() or role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- products -------------------------------------------------------------------
drop policy if exists "products: public read active" on public.products;
create policy "products: public read active" on public.products
  for select using (active or public.is_admin());

drop policy if exists "products: admin write" on public.products;
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- addresses ------------------------------------------------------------------
drop policy if exists "addresses: own rows" on public.addresses;
create policy "addresses: own rows" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders ---------------------------------------------------------------------
drop policy if exists "orders: read own" on public.orders;
create policy "orders: read own" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

-- Customers never write orders directly; the server does it with the service
-- key after validating prices. Only admins may change an order after the fact.
drop policy if exists "orders: admin write" on public.orders;
create policy "orders: admin write" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
