-- Readers can see survey definitions only after the associated trigger is due.
-- Authors retain access to all of their own surveys, including drafts.
create or replace function private.can_read_survey(p_survey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_survey_owner(p_survey_id) or exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.reader_profile_id = (select auth.uid())
      and private.can_assignment_answer_survey(reader_assignment.id, p_survey_id)
  );
$$;
