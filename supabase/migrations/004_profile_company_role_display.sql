-- Hirer profile: LinkedIn + company (shown on public role pages via denormalized columns on roles).
alter table public.profiles
  add column if not exists linkedin_url text,
  add column if not exists avatar_url text,
  add column if not exists company_name text,
  add column if not exists company_website text,
  add column if not exists company_linkedin_url text,
  add column if not exists company_logo_url text;

comment on column public.profiles.avatar_url is 'Profile photo URL (e.g. from LinkedIn).';
comment on column public.profiles.company_logo_url is 'Company logo image URL (e.g. LinkedIn company page).';

-- Role: location + match incentive + public hirer/company snapshot (synced from profile on create & settings save).
alter table public.roles
  add column if not exists location text,
  add column if not exists match_incentive text,
  add column if not exists hirer_full_name text,
  add column if not exists hirer_linkedin_url text,
  add column if not exists hirer_avatar_url text,
  add column if not exists company_name text,
  add column if not exists company_website text,
  add column if not exists company_linkedin_url text,
  add column if not exists company_logo_url text;

comment on column public.roles.match_incentive is 'e.g. referral bonus; run 006 to rename to match_bonus.';
comment on column public.roles.hirer_full_name is 'Denormalized from profiles for public page (no email leak).';

update public.roles r
set
  hirer_full_name = coalesce(r.hirer_full_name, p.full_name),
  hirer_linkedin_url = coalesce(r.hirer_linkedin_url, p.linkedin_url),
  hirer_avatar_url = coalesce(r.hirer_avatar_url, p.avatar_url),
  company_name = coalesce(r.company_name, p.company_name),
  company_website = coalesce(r.company_website, p.company_website),
  company_linkedin_url = coalesce(r.company_linkedin_url, p.company_linkedin_url),
  company_logo_url = coalesce(r.company_logo_url, p.company_logo_url)
from public.profiles p
where r.hirer_id = p.id;
