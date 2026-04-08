-- =============================================================================
-- CaroHQ + Founding Engineer role (from public job spec)
-- Run AFTER migrations 001 (and 003/004 optional — extra columns default to null).
-- Safe to re-run: upserts by company slug + role slug.
-- Company portal code: CAROHQPORTAL (change in Supabase admin if needed).
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
values (
  'CaroHQ',
  'carohq',
  null,
  'https://www.linkedin.com/company/carohq/',
  'https://carohq.com/',
  'Caro is the single source of truth for headcount that aligns finance teams, talent teams, people / HR teams, and hiring leaders. Connected with your HCM, ATS, and financial planning system, Caro keeps those systems in sync in real time. Team of 3 · founded 2023 · $5M funding. Contact: info@carohq.com.',
  'CAROHQPORTAL'
)
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  linkedin_url = excluded.linkedin_url,
  website = excluded.website,
  description = excluded.description;

insert into public.roles (company_id, title, slug, description, location, status)
select
  c.id,
  'Founding Engineer',
  'carohq-founding-engineer',
  $job$
Full-time · On-site · Palo Alto, CA

Salary: $150K–$200K. Equity: 0.3%–0.7%. Visa: H-1B transfers only (no net new petitions).

About this role
We are looking for a Founding Engineer with 2+ years of experience to join our team in building a headcount platform for enterprise teams. This role is ideal for someone who thrives in a fast-paced startup environment, is excited to work directly with founders and early customers, and is motivated by delivering tangible impact. You will be instrumental in shaping our early product and contributing to our journey toward product-market fit.

What you will do
• Ship and iterate quickly while being thoughtful about trade-offs for quality.
• Collaborate with the founders on designing the best solution for our customers’ problems.
• Interact directly with customers to diagnose and resolve issues in the product.
• Own large parts of the product independently, from technical design to shipping into production.
• Wear multiple hats, including engineering, product, and customer support.

Requirements
• 2+ years of experience in full-stack software engineering.

Work policy
Palo Alto — in-person 5 days/week.

Tech stack
GCP, MongoDB, TypeScript.

Report to
https://www.linkedin.com/in/roopakv/

Interview process
1. Introductory call (30 minutes)
2. Technical screen (1 hour)
3. On-site interview (3–4 hours)
$job$,
  'Palo Alto, CA',
  'active'
from public.companies c
where c.slug = 'carohq'
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  location = excluded.location,
  status = excluded.status,
  company_id = excluded.company_id;
