-- Landing + future connector signups. Server inserts via service role only.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'company_interest'
    check (kind in ('company_interest', 'connector')),
  company_name text,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_kind_idx on public.waitlist (kind);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

comment on table public.waitlist is 'Landing company interest and future connector waitlist; use kind to filter.';
comment on column public.waitlist.kind is 'company_interest = home form; connector = reserved for later.';
comment on column public.waitlist.company_name is 'Organization name from landing form (or optional context for connectors).';

alter table public.waitlist enable row level security;
-- No policies: anon/auth cannot access; service role bypasses RLS for server actions.
