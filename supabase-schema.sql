-- ==========================================================
-- FORGE — Supabase schema
-- Run this once in the SQL Editor to create all tables,
-- indexes, and Row Level Security policies.
-- ==========================================================

-- ==========================================================
-- TABLE: user_profiles
-- Basic profile info — extends auth.users
-- ==========================================================
create table if not exists public.user_profiles (
    user_id         uuid primary key references auth.users(id) on delete cascade,
    display_name    text,
    age             integer,
    sex             text,
    height_cm       numeric,
    units           text default 'metric',
    training_since  date,
    injuries        jsonb default '[]'::jsonb,
    rest_timer_sec  integer default 90,
    voice_on        boolean default true,
    notif_on        boolean default false,
    selected_plan   text,
    current_plan    jsonb,
    updated_at      timestamptz default now()
);

-- ==========================================================
-- TABLE: workouts
-- Every logged set — the core training data
-- ==========================================================
create table if not exists public.workouts (
    id              bigserial primary key,
    user_id         uuid not null references auth.users(id) on delete cascade,
    date            date not null,
    day             text not null,
    exercise        text not null,
    weight          numeric,
    reps            integer,
    sets            integer,
    rpe             numeric,
    e1rm            numeric,
    notes           text,
    rating          integer,
    energy          integer,
    client_id       text,           -- for offline-created records dedupe
    created_at      timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_workouts_user_date on public.workouts(user_id, date desc);
create index if not exists idx_workouts_user_exercise on public.workouts(user_id, exercise);
create unique index if not exists idx_workouts_client_id on public.workouts(user_id, client_id) where client_id is not null;

-- ==========================================================
-- TABLE: measurements
-- Body weight, body fat, circumferences over time
-- ==========================================================
create table if not exists public.measurements (
    id              bigserial primary key,
    user_id         uuid not null references auth.users(id) on delete cascade,
    date            date not null,
    weight_kg       numeric,
    body_fat_pct    numeric,
    waist_cm        numeric,
    chest_cm        numeric,
    arm_cm          numeric,
    thigh_cm        numeric,
    client_id       text,
    created_at      timestamptz default now()
);

create index if not exists idx_measurements_user_date on public.measurements(user_id, date desc);
create unique index if not exists idx_measurements_client_id on public.measurements(user_id, client_id) where client_id is not null;

-- ==========================================================
-- TABLE: food_log
-- Daily food entries
-- ==========================================================
create table if not exists public.food_log (
    id              bigserial primary key,
    user_id         uuid not null references auth.users(id) on delete cascade,
    date            date not null,
    name            text not null,
    kcal            numeric,
    protein_g       numeric,
    carbs_g         numeric,
    fat_g           numeric,
    client_id       text,
    created_at      timestamptz default now()
);

create index if not exists idx_foodlog_user_date on public.food_log(user_id, date desc);
create unique index if not exists idx_foodlog_client_id on public.food_log(user_id, client_id) where client_id is not null;

-- ==========================================================
-- TABLE: nutrition_targets
-- One row per user — their daily macro targets
-- ==========================================================
create table if not exists public.nutrition_targets (
    user_id         uuid primary key references auth.users(id) on delete cascade,
    kcal            numeric,
    protein_g       numeric,
    carbs_g         numeric,
    fat_g           numeric,
    updated_at      timestamptz default now()
);

-- ==========================================================
-- TABLE: goals
-- User-set training goals with deadlines
-- ==========================================================
create table if not exists public.goals (
    id              bigserial primary key,
    user_id         uuid not null references auth.users(id) on delete cascade,
    title           text not null,
    goal_type       text,
    exercise        text,
    target_val      numeric,
    deadline        date,
    status          text default 'active',
    created_weight  numeric,
    client_id       text,
    created_at      timestamptz default now()
);

create index if not exists idx_goals_user on public.goals(user_id, status);
create unique index if not exists idx_goals_client_id on public.goals(user_id, client_id) where client_id is not null;

-- ==========================================================
-- TABLE: earned_badges
-- Which badges a user has earned, and when
-- ==========================================================
create table if not exists public.earned_badges (
    user_id         uuid not null references auth.users(id) on delete cascade,
    badge_id        text not null,
    earned_at       timestamptz default now(),
    primary key (user_id, badge_id)
);

-- ==========================================================
-- TABLE: coach_chat
-- AI coach conversation history
-- ==========================================================
create table if not exists public.coach_chat (
    id              bigserial primary key,
    user_id         uuid not null references auth.users(id) on delete cascade,
    role            text not null,
    content         text not null,
    created_at      timestamptz default now()
);

create index if not exists idx_coach_chat_user on public.coach_chat(user_id, created_at desc);

-- ==========================================================
-- TABLE: progress_photos
-- Metadata only — actual files go in Storage bucket "photos"
-- ==========================================================
create table if not exists public.progress_photos (
    id              bigserial primary key,
    user_id         uuid not null references auth.users(id) on delete cascade,
    date            date not null,
    storage_path    text not null,  -- path in storage bucket
    label           text,
    client_id       text,
    created_at      timestamptz default now()
);

create index if not exists idx_photos_user_date on public.progress_photos(user_id, date desc);
create unique index if not exists idx_photos_client_id on public.progress_photos(user_id, client_id) where client_id is not null;

-- ==========================================================
-- ROW LEVEL SECURITY — critical for multi-user safety
-- Each user can ONLY see/edit their own rows
-- ==========================================================
alter table public.user_profiles      enable row level security;
alter table public.workouts           enable row level security;
alter table public.measurements       enable row level security;
alter table public.food_log           enable row level security;
alter table public.nutrition_targets  enable row level security;
alter table public.goals              enable row level security;
alter table public.earned_badges      enable row level security;
alter table public.coach_chat         enable row level security;
alter table public.progress_photos    enable row level security;

-- ==========================================================
-- POLICIES: every table uses the same pattern:
-- "user can only do X where user_id = auth.uid()"
-- ==========================================================

-- user_profiles
drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own" on public.user_profiles
    for select using (auth.uid() = user_id);
drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own" on public.user_profiles
    for insert with check (auth.uid() = user_id);
drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own" on public.user_profiles
    for update using (auth.uid() = user_id);
drop policy if exists "profiles_delete_own" on public.user_profiles;
create policy "profiles_delete_own" on public.user_profiles
    for delete using (auth.uid() = user_id);

-- workouts
drop policy if exists "workouts_all_own" on public.workouts;
create policy "workouts_all_own" on public.workouts
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- measurements
drop policy if exists "measurements_all_own" on public.measurements;
create policy "measurements_all_own" on public.measurements
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- food_log
drop policy if exists "foodlog_all_own" on public.food_log;
create policy "foodlog_all_own" on public.food_log
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- nutrition_targets
drop policy if exists "nutrition_all_own" on public.nutrition_targets;
create policy "nutrition_all_own" on public.nutrition_targets
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- goals
drop policy if exists "goals_all_own" on public.goals;
create policy "goals_all_own" on public.goals
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- earned_badges
drop policy if exists "badges_all_own" on public.earned_badges;
create policy "badges_all_own" on public.earned_badges
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- coach_chat
drop policy if exists "coach_chat_all_own" on public.coach_chat;
create policy "coach_chat_all_own" on public.coach_chat
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- progress_photos
drop policy if exists "photos_all_own" on public.progress_photos;
create policy "photos_all_own" on public.progress_photos
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ==========================================================
-- STORAGE: bucket for progress photos
-- (Also need to enable RLS on the storage bucket via dashboard)
-- ==========================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Storage policy: users can only access their own folder inside the bucket
-- Path convention: progress-photos/{user_id}/{filename}
drop policy if exists "photos_storage_select_own" on storage.objects;
create policy "photos_storage_select_own" on storage.objects
    for select using (
        bucket_id = 'progress-photos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists "photos_storage_insert_own" on storage.objects;
create policy "photos_storage_insert_own" on storage.objects
    for insert with check (
        bucket_id = 'progress-photos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists "photos_storage_update_own" on storage.objects;
create policy "photos_storage_update_own" on storage.objects
    for update using (
        bucket_id = 'progress-photos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists "photos_storage_delete_own" on storage.objects;
create policy "photos_storage_delete_own" on storage.objects
    for delete using (
        bucket_id = 'progress-photos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

-- ==========================================================
-- AUTO-CREATE user_profile when a user signs up
-- This trigger fires when someone registers so they
-- always have a profile row waiting
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.user_profiles (user_id, display_name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', null)
    )
    on conflict (user_id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==========================================================
-- DONE! You should see "Success. No rows returned" below.
-- ==========================================================
