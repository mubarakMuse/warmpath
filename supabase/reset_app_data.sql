-- =============================================================================
-- Warmpath — delete all application rows (manual run in Supabase SQL Editor).
-- Order respects foreign keys. Review before executing.
--
-- Does NOT remove auth.users (people can still sign in; recreate profiles on next login).
-- Uncomment the optional block only if you want a full Auth wipe too.
-- =============================================================================

begin;

delete from public.submissions;
delete from public.roles;
delete from public.profile_companies;
delete from public.profiles;
delete from public.companies;
delete from public.waitlist;

commit;

-- Optional: remove every Supabase Auth user (irreversible).
-- begin;
-- delete from auth.users;
-- commit;
