-- The first reader to see a survey establishes the questionnaire that every
-- later reader must answer. An in-progress submission is that durable view
-- record; it intentionally does not count as submitted feedback.
create or replace function private.prevent_survey_definition_mutation_after_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_survey_id uuid;
begin
  if tg_table_name = 'survey_questions' then
    target_survey_id := case
      when tg_op = 'DELETE' then old.survey_id
      else new.survey_id
    end;
  else
    select survey_question.survey_id
      into target_survey_id
    from public.survey_questions survey_question
    where survey_question.id = case
      when tg_op = 'DELETE' then old.survey_question_id
      else new.survey_question_id
    end;
  end if;

  if exists (
    select 1
    from public.survey_submissions survey_submission
    where survey_submission.survey_id = target_survey_id
  ) then
    raise exception 'Surveys already shown to readers cannot have their questions or options changed.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;
