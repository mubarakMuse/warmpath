-- App users (hirers today). MVP: access_code login. Later: set auth_user_id = auth.users.id (e.g. Google).
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

-- Job / role searches (shareable)
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

-- Applications and referrals
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  kind text not null check (kind in ('self', 'referral')),
  submitter_email text not null,
  submitter_name text,
  self_pitch text,
  self_linkedin_url text,
  candidate_name text,
  why_fit text,
  relationship text,
  candidate_linkedin_url text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_role_id_idx on public.submissions (role_id);
create index if not exists submissions_submitter_email_idx on public.submissions (lower(submitter_email));

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
