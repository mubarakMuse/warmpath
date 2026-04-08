-- =============================================================================
-- Warmpath — companies + roles (minimal recruiting CMS)
-- Run in Supabase: SQL Editor → New query, or `supabase db push` if using CLI.
--
-- RLS: enabled on both tables with NO policies for anon/authenticated.
--      → Browser clients using the anon key cannot read/write these tables.
--      → The Next.js app uses SUPABASE_SERVICE_ROLE_KEY only (server-side);
--        the service role bypasses RLS in Supabase.
-- =============================================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  linkedin_url text,
  website text,
  description text,
  access_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists companies_slug_idx on public.companies (slug);
create index if not exists companies_access_code_idx on public.companies (access_code);

comment on table public.companies is 'Organizations; company staff use access_code on /company/login.';
comment on column public.companies.access_code is 'Shared code for company portal (not a user password).';

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  location text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists roles_company_id_idx on public.roles (company_id);
create index if not exists roles_status_idx on public.roles (status);

comment on table public.roles is 'Job postings under a company; slug unique globally for future public URLs.';

alter table public.companies enable row level security;
alter table public.roles enable row level security;

-- Intentionally no policies: anon/authenticated JWT cannot access these tables.
-- Service role (used only in trusted server code) bypasses RLS.
