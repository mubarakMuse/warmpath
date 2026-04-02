-- Roles can exist without a hiring manager until admin assigns one.
-- Public read only when published (not draft) and a hirer is assigned.

alter table public.roles alter column hirer_id drop not null;

drop policy if exists "roles_select_public_anon" on public.roles;

create policy "roles_select_public_anon"
  on public.roles
  for select
  to anon, authenticated
  using (status <> 'draft' and hirer_id is not null);

comment on column public.roles.hirer_id is 'Null until admin assigns a hiring manager; keep status draft until then.';
