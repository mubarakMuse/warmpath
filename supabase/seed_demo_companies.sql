-- =============================================================================
-- Demo seed: Owner.com + Brighter Tunnel
-- Run AFTER 001_companies_roles.sql. Safe to re-run: upserts by slug.
-- Replace access_code values if you already use these codes elsewhere.
-- =============================================================================

insert into public.companies (
  name,
  slug,
  logo_url,
  linkedin_url,
  website,
  description,
  access_code
)
values
  (
    'Owner',
    'owner',
    null,
    'https://www.linkedin.com/company/ownercom/',
    'https://www.owner.com/',
    'All-in-one platform for restaurants online: websites, orders, branded apps, CRM, and marketing.',
    'OWNERPORTAL'
  ),
  (
    'Brighter Tunnel',
    'brighter-tunnel',
    null,
    'https://www.linkedin.com/company/brighter-tunnel',
    'https://brightertunnel.com/',
    'Technology consulting: custom software, AI integration, and technical interview services for hiring teams.',
    'BRIGHTER2025'
  )
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  linkedin_url = excluded.linkedin_url,
  website = excluded.website,
  description = excluded.description;
-- Note: on conflict we do NOT overwrite access_code so you can rotate codes in admin without seed resetting them.

insert into public.roles (company_id, title, slug, description, location, status)
select c.id,
  'Senior Software Engineer, Fullstack',
  'owner-senior-fullstack',
  'Build products 0→1; TypeScript, React/Next, Node, Mongo; remote US/Canada (excl. Quebec). $190K–$220K + equity.',
  'Remote — US or Canada (except Quebec)',
  'draft'
from public.companies c
where c.slug = 'owner'
on conflict (slug) do update set
  description = excluded.description,
  location = excluded.location,
  company_id = excluded.company_id;

insert into public.roles (company_id, title, slug, description, location, status)
select c.id,
  'Senior Software Engineer (Technical Interviews)',
  'brighter-senior-interviewer',
  'Conduct technical screens for partner companies; strong CS fundamentals and communication.',
  'Remote / Minneapolis area',
  'draft'
from public.companies c
where c.slug = 'brighter-tunnel'
on conflict (slug) do update set
  description = excluded.description,
  location = excluded.location,
  company_id = excluded.company_id;
