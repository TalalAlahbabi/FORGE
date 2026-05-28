-- ==========================================================
-- FORGE v2 — simplified cloud sync (single JSON blob per user)
-- Run this in Supabase SQL Editor.
-- ==========================================================

create table if not exists public.forge_data (
    user_id     uuid primary key references auth.users(id) on delete cascade,
    data        jsonb not null default '{}'::jsonb,
    updated_at  timestamptz default now()
);

alter table public.forge_data enable row level security;

drop policy if exists "forge_data_own" on public.forge_data;
create policy "forge_data_own" on public.forge_data
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Done. You should see "Success. No rows returned."
