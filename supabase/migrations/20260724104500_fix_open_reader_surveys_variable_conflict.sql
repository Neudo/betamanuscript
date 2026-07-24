-- `RETURNS TABLE (survey_id uuid)` creates a PL/pgSQL output variable called
-- `survey_id`. Avoid unqualified column references inside the function so the
-- function remains valid regardless of PostgreSQL's variable-conflict setting.
create or replace function public.open_reader_surveys(
  p_reader_assignment_id uuid,
  p_survey_ids uuid[]
)
returns table (survey_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  distinct_survey_ids uuid[];
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select coalesce(array_agg(distinct requested.survey_id), array[]::uuid[])
    into distinct_survey_ids
  from unnest(coalesce(p_survey_ids, array[]::uuid[])) as requested(survey_id);

  if cardinality(distinct_survey_ids) = 0 then
    return;
  end if;

  if exists (
    select 1
    from unnest(distinct_survey_ids) as requested(survey_id)
    where not private.can_assignment_answer_survey(
      p_reader_assignment_id,
      requested.survey_id
    )
  ) then
    raise exception 'One or more surveys are not available for this reader.' using errcode = '42501';
  end if;

  return query
  with inserted as (
    insert into public.survey_submissions as submission (
      reader_assignment_id,
      status,
      survey_id
    )
    select
      p_reader_assignment_id,
      'in_progress',
      requested.survey_id
    from unnest(distinct_survey_ids) as requested(survey_id)
    on conflict on constraint survey_submissions_survey_id_reader_assignment_id_key do nothing
    returning submission.survey_id as inserted_survey_id
  )
  select inserted.inserted_survey_id
  from inserted;
end;
$$;
