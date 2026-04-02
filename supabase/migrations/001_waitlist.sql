-- Run this in the Supabase SQL Editor (Dashboard → SQL) for a new project.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Allow anonymous and signed-in clients to insert waitlist rows only.
create policy "waitlist_insert_anon"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- No public read: omit select policies for anon/authenticated.

comment on table public.waitlist is 'Landing page waitlist signups';
