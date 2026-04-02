-- Companies (admin-provisioned), hirer invite/claim, optional role→company link.

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website text,
  linkedin_url text,
  logo_url text,
  created_at timestamptz not null default now()
);

comment on table public.companies is 'Organizations admin creates; hirers link via profiles.company_id.';

alter table public.companies enable row level security;

alter table public.profiles
  add column if not exists company_id uuid references public.companies (id) on delete set null;

alter table public.profiles
  add column if not exists claim_status text default 'active';

update public.profiles set claim_status = 'active' where claim_status is null;

alter table public.profiles
  alter column claim_status set not null;

alter table public.profiles
  drop constraint if exists profiles_claim_status_check;

alter table public.profiles
  add constraint profiles_claim_status_check
  check (claim_status in ('pending', 'active'));

comment on column public.profiles.claim_status is 'pending = admin-provisioned, awaiting Google claim; active = normal.';
comment on column public.profiles.company_id is 'Optional FK to companies for admin-provisioned orgs.';

alter table public.profiles
  add column if not exists invite_token text;

create unique index if not exists profiles_invite_token_unique
  on public.profiles (invite_token)
  where invite_token is not null;

alter table public.profiles
  add column if not exists invite_expires_at timestamptz;

comment on column public.profiles.invite_token is 'Opaque token for /claim/[token] before first OAuth.';
comment on column public.profiles.invite_expires_at is 'Optional expiry for invite_token.';

create index if not exists profiles_company_id_idx on public.profiles (company_id)
  where company_id is not null;

alter table public.roles
  add column if not exists company_id uuid references public.companies (id) on delete set null;

create index if not exists roles_company_id_idx on public.roles (company_id)
  where company_id is not null;

comment on column public.roles.company_id is 'Optional link to companies when admin provisions org + roles.';
