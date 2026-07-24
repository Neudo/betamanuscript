-- Readers may revisit a response they already sent. Keep the edit path
-- separate from the initial submission path: it temporarily reopens the
-- existing row inside one transaction, then delegates all payload validation
-- and persistence to the canonical submit_reader_survey RPC.

create or replace function public.update_reader_survey_response(
  p_reader_assignment_id uuid,
  p_survey_id uuid,
  p_answers jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_submission_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not private.can_assignment_answer_survey(
    p_reader_assignment_id,
    p_survey_id
  ) then
    raise exception 'This survey is no longer available for editing.' using errcode = '42501';
  end if;

  select survey_submission.id
    into target_submission_id
  from public.survey_submissions survey_submission
  where survey_submission.reader_assignment_id = p_reader_assignment_id
    and survey_submission.survey_id = p_survey_id
    and survey_submission.status = 'submitted'
  for update;

  if target_submission_id is null then
    raise exception 'No submitted response was found for this survey.' using errcode = '22023';
  end if;

  -- This status exists only inside this transaction. submit_reader_survey
  -- locks the same row, validates every answer, replaces them atomically and
  -- marks it submitted again before this function can commit.
  update public.survey_submissions survey_submission
  set
    status = 'in_progress',
    submitted_at = null
  where survey_submission.id = target_submission_id;

  perform public.submit_reader_survey(
    p_reader_assignment_id,
    p_survey_id,
    p_answers
  );

  return target_submission_id;
end;
$$;

revoke all on function public.update_reader_survey_response(uuid, uuid, jsonb)
from public, anon;
grant execute on function public.update_reader_survey_response(uuid, uuid, jsonb)
to authenticated;

-- A reader must keep access to their own submitted history even if an author
-- closes the survey after collecting feedback. Closing a survey still blocks
-- editing because the RPC above requires an active survey.
create or replace function private.can_read_survey(p_survey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_survey_owner(p_survey_id) or exists (
    select 1
    from public.surveys survey
    where survey.id = p_survey_id
      and survey.status = 'active'
      and private.has_round_assignment(survey.reading_round_id)
  ) or exists (
    select 1
    from public.survey_submissions survey_submission
    where survey_submission.survey_id = p_survey_id
      and survey_submission.status = 'submitted'
      and private.is_submission_owner(survey_submission.id)
  );
$$;

drop policy if exists "Survey owners and readers can read submissions"
on public.survey_submissions;

create policy "Survey owners and readers can read submissions"
on public.survey_submissions for select to authenticated
using (
  private.is_survey_owner(survey_id)
  or private.is_submission_owner(id)
  or private.can_assignment_answer_survey(reader_assignment_id, survey_id)
);
