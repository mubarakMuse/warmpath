-- Company workflow on connector referrals: stage + optional structured/free-text reason.

alter table public.connector_referrals
  add column if not exists referral_stage text not null default 'new'
  check (
    referral_stage in (
      'new',
      'reviewing',
      'interviewing',
      'offer',
      'hired',
      'rejected'
    )
  );

alter table public.connector_referrals add column if not exists company_reason_preset text;
alter table public.connector_referrals add column if not exists company_reason_note text;
alter table public.connector_referrals add column if not exists company_responded_at timestamptz;

comment on column public.connector_referrals.referral_stage is 'Pipeline stage set by the hiring company.';
comment on column public.connector_referrals.company_reason_preset is 'Optional canned reason key (see app REASON_PRESETS).';
comment on column public.connector_referrals.company_reason_note is 'Optional free-text note from the company.';
comment on column public.connector_referrals.company_responded_at is 'Last time the company saved a response update.';
