-- ONLY if you previously ran an OLD 002 that created public.managers + roles.manager_id.
-- If you never ran any SQL, use init_all.sql (or 001 + 002) instead — do NOT run this file.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'managers'
  ) then
    -- Ensure profiles exists (in case of partial state)
    create table if not exists public.profiles (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      full_name text not null,
      access_code text unique,
      account_role text not null default 'hirer'
        check (account_role in ('hirer', 'connector', 'admin')),
      auth_user_id uuid unique references auth.users (id) on delete set null,
      created_at timestamptz not null default now()
    );

    insert into public.profiles (id, email, full_name, access_code, account_role, auth_user_id)
    select id, lower(trim(email)), name, access_code, 'hirer', null
    from public.managers
    on conflict (id) do nothing;

    alter table public.roles drop constraint if exists roles_manager_id_fkey;
    alter table public.roles rename column manager_id to hirer_id;
    alter table public.roles
      add constraint roles_hirer_id_fkey
      foreign key (hirer_id) references public.profiles (id) on delete cascade;

    drop table public.managers;

    raise notice 'Migrated managers -> profiles and roles.manager_id -> hirer_id.';
  end if;
end $$;
