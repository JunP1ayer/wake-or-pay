-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table public.user_profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  timezone text default 'Asia/Tokyo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Alarms table
create table public.alarms (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  alarm_time time not null,
  is_active boolean default true,
  penalty_amount integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wake attempts table
create table public.wake_attempts (
  id uuid primary key default uuid_generate_v4(),
  alarm_id uuid references public.alarms(id) not null,
  user_id uuid references auth.users(id) not null,
  attempted_at timestamptz default now(),
  success boolean not null,
  verification_method text check (verification_method in ('face', 'manual')),
  failure_reason text,
  created_at timestamptz default now()
);

-- Payment transactions table
create table public.payment_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  stripe_payment_intent_id text unique not null,
  amount integer not null, -- in yen
  status text not null,
  wake_attempt_id uuid references public.wake_attempts(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.alarms enable row level security;
alter table public.wake_attempts enable row level security;
alter table public.payment_transactions enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own alarms" on public.alarms
  for all using (auth.uid() = user_id);

create policy "Users can view own wake attempts" on public.wake_attempts
  for all using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.payment_transactions
  for select using (auth.uid() = user_id);

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

create trigger alarms_updated_at
  before update on public.alarms
  for each row execute procedure public.handle_updated_at();

create trigger payment_transactions_updated_at
  before update on public.payment_transactions
  for each row execute procedure public.handle_updated_at();

-- Indexes for performance
create index idx_alarms_user_id on public.alarms(user_id);
create index idx_alarms_active on public.alarms(user_id, is_active);
create index idx_wake_attempts_user_id on public.wake_attempts(user_id);
create index idx_wake_attempts_alarm_id on public.wake_attempts(alarm_id);
create index idx_payment_transactions_user_id on public.payment_transactions(user_id);
create index idx_payment_transactions_stripe_id on public.payment_transactions(stripe_payment_intent_id);