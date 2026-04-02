-- Referral bonus field renamed for clarity (was match_incentive).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'roles' and column_name = 'match_incentive'
  ) then
    alter table public.roles rename column match_incentive to match_bonus;
  end if;
end $$;

comment on column public.roles.match_bonus is 'Match / referral bonus copy (e.g. $5,000) shown on the public role page.';
