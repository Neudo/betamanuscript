-- Free authors can keep two surveys on their active manuscript. The profile
-- row is locked so concurrent inserts cannot both pass the quota check.
create or replace function private.enforce_survey_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_profile_id uuid;
  current_plan public.account_plan;
begin
  select manuscript.owner_id into owner_profile_id
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = new.reading_round_id;

  if owner_profile_id is null then
    raise exception 'The survey must belong to a manuscript owner profile.';
  end if;

  perform private.refresh_profile_billing_plan(owner_profile_id);

  select profile.plan into current_plan
  from public.profiles profile
  where profile.id = owner_profile_id
  for update;

  if current_plan is null then
    raise exception 'The survey owner must have a profile.';
  end if;

  if current_plan = 'free' and (
    select count(*)
    from public.surveys survey
    join public.reading_rounds reading_round
      on reading_round.id = survey.reading_round_id
    join public.manuscript_versions manuscript_version
      on manuscript_version.id = reading_round.manuscript_version_id
    join public.manuscripts manuscript
      on manuscript.id = manuscript_version.manuscript_id
    where manuscript.owner_id = owner_profile_id
      and manuscript.archived_at is null
      and (tg_op = 'INSERT' or survey.id <> new.id)
  ) >= 2 then
    raise exception 'The free plan is limited to two surveys.';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_survey_plan_limit()
from public, anon, authenticated;

create trigger surveys_enforce_plan_limit
before insert or update of reading_round_id on public.surveys
for each row execute procedure private.enforce_survey_plan_limit();
