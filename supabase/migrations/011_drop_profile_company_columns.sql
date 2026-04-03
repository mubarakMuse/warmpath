-- Company branding lives on public.companies (joined in the app for display).
-- Hirer profiles no longer store org marketing fields.

alter table public.profiles drop column if exists company_name;
alter table public.profiles drop column if exists company_website;
alter table public.profiles drop column if exists company_linkedin_url;
alter table public.profiles drop column if exists company_logo_url;

-- roles.company_id remains; denormalized role display columns are dropped in migration 012.
