-- Rich hiring pipeline for roles; migrate legacy active/closed.

alter table public.roles drop constraint if exists roles_status_check;

update public.roles set status = 'sourcing' where status = 'active';
-- 'closed' stays valid in new set

alter table public.roles
  add constraint roles_status_check check (
    status in (
      'draft',
      'getting_started',
      'sourcing',
      'screening',
      'interviewing',
      'offer',
      'hired',
      'on_hold',
      'closed'
    )
  );

alter table public.roles alter column status set default 'getting_started';

drop policy if exists "roles_select_active_anon" on public.roles;
drop policy if exists "submissions_insert_active_role" on public.submissions;

-- Public can open any role page except draft (hirer-only while drafting).
create policy "roles_select_public_anon"
  on public.roles
  for select
  to anon, authenticated
  using (status <> 'draft');

-- Submissions only while actively building the pipeline (not offer/hired/hold/closed).
create policy "submissions_insert_open_pipeline"
  on public.submissions
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.roles r
      where r.id = role_id
        and r.status in (
          'getting_started',
          'sourcing',
          'screening',
          'interviewing'
        )
    )
  );

comment on column public.roles.status is 'Hiring pipeline: draft → getting_started → sourcing → screening → interviewing → offer → hired | on_hold | closed';
