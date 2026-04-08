-- Per-role referral bonus (internal only — not exposed on public job page).
alter table public.roles add column if not exists referral_bonus text;

comment on column public.roles.referral_bonus is
  'Optional note (e.g. bonus amount). Shown to admin, company portal, and connectors only.';

-- Optional candidate context on connector referrals.
alter table public.connector_referrals add column if not exists candidate_name text;
alter table public.connector_referrals add column if not exists candidate_email text;
alter table public.connector_referrals add column if not exists relationship_type text;
alter table public.connector_referrals add column if not exists relationship_other text;

comment on column public.connector_referrals.relationship_type is
  'How connector knows candidate: colleague, friend, other, etc.; relationship_other when other.';
