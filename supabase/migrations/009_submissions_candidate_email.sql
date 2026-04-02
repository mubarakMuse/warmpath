-- Optional: ties a referral submission to a candidate’s account (connector dashboard).
alter table public.submissions
  add column if not exists candidate_email text;

create index if not exists submissions_candidate_email_idx
  on public.submissions (candidate_email)
  where candidate_email is not null;

comment on column public.submissions.candidate_email is
  'When set on a referral, the candidate can see this intro on their connector dashboard if they sign in with the same email.';
