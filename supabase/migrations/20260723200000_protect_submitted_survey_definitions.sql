-- A submitted answer must always retain the exact question and option structure
-- that the reader saw. Authors can duplicate a survey when they need a revision.
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
    raise exception 'Surveys with responses cannot have their questions or options changed.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists survey_questions_protect_submitted_definition
  on public.survey_questions;
create trigger survey_questions_protect_submitted_definition
before insert or update or delete on public.survey_questions
for each row execute procedure private.prevent_survey_definition_mutation_after_submission();

drop trigger if exists survey_question_options_protect_submitted_definition
  on public.survey_question_options;
create trigger survey_question_options_protect_submitted_definition
before insert or update or delete on public.survey_question_options
for each row execute procedure private.prevent_survey_definition_mutation_after_submission();
