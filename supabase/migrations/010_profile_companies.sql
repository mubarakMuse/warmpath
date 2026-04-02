-- Hirers ↔ companies many-to-many. Roles keep their own company_id (organization for that job).
-- is_primary = default company when creating a role without picking an org.

create table if not exists public.profile_companies (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (profile_id, company_id)
);

create unique index if not exists profile_companies_one_primary_per_profile
  on public.profile_companies (profile_id)
  where is_primary;

create index if not exists profile_companies_company_id_idx
  on public.profile_companies (company_id);

comment on table public.profile_companies is 'Hiring managers/admins linked to one or more organizations; one row per profile is primary.';
comment on column public.profile_companies.is_primary is 'Default org for new roles when role company is not specified.';

insert into public.profile_companies (profile_id, company_id, is_primary)
select p.id, p.company_id, true
from public.profiles p
where p.company_id is not null
on conflict (profile_id, company_id) do nothing;

alter table public.profiles drop column if exists company_id;

drop index if exists profiles_company_id_idx;

alter table public.profile_companies enable row level security;

comment on table public.companies is 'Organizations; linked to hirers via profile_companies and to jobs via roles.company_id.';
