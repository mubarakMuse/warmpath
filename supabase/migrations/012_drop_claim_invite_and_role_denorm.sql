-- Remove invite/claim flow columns from profiles.
drop index if exists public.profiles_invite_token_unique;

alter table public.profiles drop column if exists invite_token;
alter table public.profiles drop column if exists invite_expires_at;

alter table public.profiles drop constraint if exists profiles_claim_status_check;
alter table public.profiles drop column if exists claim_status;

-- Hirer/company marketing fields on roles: load via joins (profiles + companies) in the app.
alter table public.roles drop column if exists hirer_full_name;
alter table public.roles drop column if exists hirer_linkedin_url;
alter table public.roles drop column if exists hirer_avatar_url;
alter table public.roles drop column if exists company_name;
alter table public.roles drop column if exists company_website;
alter table public.roles drop column if exists company_linkedin_url;
alter table public.roles drop column if exists company_logo_url;
