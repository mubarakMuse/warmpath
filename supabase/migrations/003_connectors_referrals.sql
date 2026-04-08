-- Connectors (PMs, EMs, etc.) submit talent to open roles via /connect/login + access code.

create table if not exists public.connectors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text,
  email text,
  linkedin_url text,
  access_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists connectors_access_code_idx on public.connectors (access_code);

comment on table public.connectors is 'People who refer candidates; access_code for /connect/login.';
comment on column public.connectors.role_title is 'e.g. Product Manager, Engineering Manager — how they introduce themselves.';

create table if not exists public.connector_referrals (
  id uuid primary key default gen_random_uuid(),
  connector_id uuid not null references public.connectors (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  candidate_linkedin_url text not null,
  fit_description text not null,
  created_at timestamptz not null default now()
);

create index if not exists connector_referrals_connector_id_idx on public.connector_referrals (connector_id);
create index if not exists connector_referrals_role_id_idx on public.connector_referrals (role_id);
create index if not exists connector_referrals_created_at_idx on public.connector_referrals (created_at desc);

comment on table public.connector_referrals is 'Candidate referral from a connector to a specific role (LinkedIn + why they fit).';

alter table public.connectors enable row level security;
alter table public.connector_referrals enable row level security;
