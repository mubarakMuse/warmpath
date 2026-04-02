-- =============================================================================
-- Warmpath — run this ONCE in Supabase: Dashboard → SQL → New query → Run
-- Combines waitlist + hiring MVP. Skip 003_migrate_managers_to_profiles.sql
-- (that file is only if you already had the old "managers" table).
--
-- If you already ran an OLDER version of this file (before profile/company columns),
-- run migrations/004_profile_company_role_display.sql as well.
-- If your roles still use active/closed only, run migrations/005_role_pipeline_status.sql.
-- If your column is still match_incentive, run migrations/006_match_bonus_rename.sql.
-- For companies + invite/claim + connectors: run migrations/007_companies_claims_connectors.sql.
-- For optional hirer on roles + public policy: run migrations/008_roles_optional_hirer_public_policy.sql.
-- For referral → candidate dashboard link: run migrations/009_submissions_candidate_email.sql.
-- To wipe app data: run reset_app_data.sql (manual; not auto-applied).
-- =============================================================================

-- --- Waitlist (landing page) ---
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

create policy "waitlist_insert_anon"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

comment on table public.waitlist is 'Landing page waitlist signups';

-- --- Profiles, roles, submissions ---
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  access_code text unique,
  account_role text not null default 'hirer'
    check (account_role in ('hirer', 'connector', 'admin')),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  linkedin_url text,
  avatar_url text,
  company_name text,
  company_website text,
  company_linkedin_url text,
  company_logo_url text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_auth_user_id_idx on public.profiles (auth_user_id)
  where auth_user_id is not null;

comment on table public.profiles is 'Warmpath users; link auth_user_id when enabling Supabase Auth (Google).';
comment on column public.profiles.access_code is 'Optional short code for passwordless MVP; can be null after OAuth if you clear it.';
comment on column public.profiles.auth_user_id is 'Supabase Auth user id; null until they sign in with Google (or magic link).';

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  hirer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  slug text not null unique,
  status text not null default 'getting_started'
    check (
      status in (
        'draft',
        'getting_started',
        'sourcing',
        'screening',
        'interviewing',
        'offer',
        'hired',
        'on_hold',
        'closed'
      )
    ),
  location text,
  match_bonus text,
  hirer_full_name text,
  hirer_linkedin_url text,
  hirer_avatar_url text,
  company_name text,
  company_website text,
  company_linkedin_url text,
  company_logo_url text,
  created_at timestamptz not null default now()
);

create index if not exists roles_hirer_id_idx on public.roles (hirer_id);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  kind text not null check (kind in ('self', 'referral')),
  submitter_email text not null,
  submitter_name text,
  self_pitch text,
  self_linkedin_url text,
  candidate_name text,
  candidate_email text,
  why_fit text,
  relationship text,
  candidate_linkedin_url text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_role_id_idx on public.submissions (role_id);
create index if not exists submissions_submitter_email_idx on public.submissions (lower(submitter_email));
create index if not exists submissions_candidate_email_idx
  on public.submissions (candidate_email)
  where candidate_email is not null;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.submissions enable row level security;

create policy "roles_select_public_anon"
  on public.roles
  for select
  to anon, authenticated
  using (status <> 'draft');

create policy "submissions_insert_open_pipeline"
  on public.submissions
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.roles r
      where r.id = role_id
        and r.status in (
          'getting_started',
          'sourcing',
          'screening',
          'interviewing'
        )
    )
  );

comment on table public.roles is 'Open role searches with shareable slug';
comment on table public.submissions is 'Self apply or referral; keyed by submitter_email';
