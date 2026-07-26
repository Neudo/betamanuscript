-- A multiple-choice question represents a set of selected options. Keep one
-- normalized answer row per selected option, while preserving the single-row
-- invariant for rating, yes/no and open-text questions.
alter table public.survey_answers
  drop constraint if exists survey_answers_survey_submission_id_survey_question_id_key;

create unique index if not exists survey_answers_submission_question_option_unique_idx
  on public.survey_answers (
    survey_submission_id,
    survey_question_id,
    selected_option_id
  )
  where selected_option_id is not null;

create unique index if not exists survey_answers_submission_question_scalar_unique_idx
  on public.survey_answers (
    survey_submission_id,
    survey_question_id
  )
  where selected_option_id is null;

create or replace function public.submit_reader_survey(
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
  answer jsonb;
  answer_count integer;
  answer_question_id uuid;
  existing_status public.survey_submission_status;
  target_submission_id uuid;
  question record;
  value_as_boolean boolean;
  value_as_number numeric;
  value_as_option_ids uuid[];
  value_as_text text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_answers) is distinct from 'array' then
    raise exception 'Survey answers must be an array.' using errcode = '22023';
  end if;

  if not private.can_assignment_answer_survey(
    p_reader_assignment_id,
    p_survey_id
  ) then
    raise exception 'This survey is not available for this reader.' using errcode = '42501';
  end if;

  -- Validate every referenced question before changing any row.
  for answer in
    select submitted_answer.value
    from jsonb_array_elements(p_answers) as submitted_answer(value)
  loop
    if jsonb_typeof(answer) <> 'object' or not (answer ? 'question_id') then
      raise exception 'Each survey answer needs a question id.' using errcode = '22023';
    end if;

    begin
      answer_question_id := (answer ->> 'question_id')::uuid;
    exception
      when invalid_text_representation then
        raise exception 'Each survey answer needs a valid question id.' using errcode = '22023';
    end;

    if not exists (
      select 1
      from public.survey_questions survey_question
      where survey_question.id = answer_question_id
        and survey_question.survey_id = p_survey_id
    ) then
      raise exception 'A survey answer references a question from another survey.' using errcode = '22023';
    end if;

    select count(*)
      into answer_count
    from jsonb_array_elements(p_answers) as candidate(value)
    where candidate.value ->> 'question_id' = answer_question_id::text;

    if answer_count > 1 then
      raise exception 'A question can only be answered once.' using errcode = '22023';
    end if;
  end loop;

  for question in
    select
      survey_question.id,
      survey_question.is_required,
      survey_question.question_type
    from public.survey_questions survey_question
    where survey_question.survey_id = p_survey_id
    order by survey_question.position
  loop
    select submitted_answer.value
      into answer
    from jsonb_array_elements(p_answers) as submitted_answer(value)
    where submitted_answer.value ->> 'question_id' = question.id::text;

    if answer is null then
      if question.is_required then
        raise exception 'Please answer every required question.' using errcode = '22023';
      end if;
      continue;
    end if;

    if question.question_type = 'rating' then
      if jsonb_typeof(answer -> 'number_value') <> 'number'
        or answer ? 'text_value'
        or answer ? 'boolean_value'
        or answer ? 'selected_option_id'
        or answer ? 'selected_option_ids'
      then
        raise exception 'A rating answer must be a number from 1 to 5.' using errcode = '22023';
      end if;

      value_as_number := (answer ->> 'number_value')::numeric;
      if value_as_number < 1 or value_as_number > 5 or value_as_number <> trunc(value_as_number) then
        raise exception 'A rating answer must be a whole number from 1 to 5.' using errcode = '22023';
      end if;

    elsif question.question_type = 'yes_no' then
      if jsonb_typeof(answer -> 'boolean_value') <> 'boolean'
        or answer ? 'text_value'
        or answer ? 'number_value'
        or answer ? 'selected_option_id'
        or answer ? 'selected_option_ids'
      then
        raise exception 'A yes/no answer must be true or false.' using errcode = '22023';
      end if;

      value_as_boolean := (answer ->> 'boolean_value')::boolean;

    elsif question.question_type = 'multiple_choice' then
      if jsonb_typeof(answer -> 'selected_option_ids') <> 'array'
        or answer ? 'text_value'
        or answer ? 'number_value'
        or answer ? 'boolean_value'
        or answer ? 'selected_option_id'
      then
        raise exception 'A multiple-choice answer must select one or more options.' using errcode = '22023';
      end if;

      begin
        select coalesce(array_agg(option_id.value::uuid), array[]::uuid[])
          into value_as_option_ids
        from jsonb_array_elements_text(answer -> 'selected_option_ids') as option_id(value);
      exception
        when invalid_text_representation then
          raise exception 'A multiple-choice answer needs valid options.' using errcode = '22023';
      end;

      if cardinality(value_as_option_ids) = 0 then
        raise exception 'A multiple-choice answer must select one or more options.' using errcode = '22023';
      end if;

      if cardinality(value_as_option_ids) <> cardinality(array(select distinct unnest(value_as_option_ids))) then
        raise exception 'A multiple-choice answer cannot select the same option twice.' using errcode = '22023';
      end if;

      if exists (
        select 1
        from unnest(value_as_option_ids) as selected_option(id)
        where not exists (
          select 1
          from public.survey_question_options survey_question_option
          where survey_question_option.id = selected_option.id
            and survey_question_option.survey_question_id = question.id
        )
      ) then
        raise exception 'One or more selected options do not belong to this question.' using errcode = '22023';
      end if;

    elsif question.question_type = 'open_text' then
      if jsonb_typeof(answer -> 'text_value') <> 'string'
        or answer ? 'number_value'
        or answer ? 'boolean_value'
        or answer ? 'selected_option_id'
        or answer ? 'selected_option_ids'
      then
        raise exception 'An open-text answer must be text.' using errcode = '22023';
      end if;

      value_as_text := btrim(answer ->> 'text_value');
      if value_as_text = '' or char_length(value_as_text) > 10000 then
        raise exception 'Open-text answers must contain up to 10,000 characters.' using errcode = '22023';
      end if;

    else
      raise exception 'The survey contains an unsupported question type.' using errcode = '22023';
    end if;
  end loop;

  target_submission_id := null;
  existing_status := null;
  insert into public.survey_submissions (
    reader_assignment_id,
    status,
    survey_id
  ) values (
    p_reader_assignment_id,
    'in_progress',
    p_survey_id
  )
  on conflict (survey_id, reader_assignment_id) do nothing
  returning id, status into target_submission_id, existing_status;

  if target_submission_id is null then
    select survey_submission.id, survey_submission.status
      into target_submission_id, existing_status
    from public.survey_submissions survey_submission
    where survey_submission.survey_id = p_survey_id
      and survey_submission.reader_assignment_id = p_reader_assignment_id
    for update;
  end if;

  if existing_status = 'submitted' then
    raise exception 'This survey has already been submitted.' using errcode = '22023';
  end if;

  delete from public.survey_answers survey_answer
  where survey_answer.survey_submission_id = target_submission_id;

  for question in
    select
      survey_question.id,
      survey_question.question_type
    from public.survey_questions survey_question
    where survey_question.survey_id = p_survey_id
    order by survey_question.position
  loop
    select submitted_answer.value
      into answer
    from jsonb_array_elements(p_answers) as submitted_answer(value)
    where submitted_answer.value ->> 'question_id' = question.id::text;

    if answer is null then
      continue;
    end if;

    if question.question_type = 'rating' then
      insert into public.survey_answers (
        number_value,
        survey_question_id,
        survey_submission_id
      ) values (
        (answer ->> 'number_value')::numeric,
        question.id,
        target_submission_id
      );
    elsif question.question_type = 'yes_no' then
      insert into public.survey_answers (
        boolean_value,
        survey_question_id,
        survey_submission_id
      ) values (
        (answer ->> 'boolean_value')::boolean,
        question.id,
        target_submission_id
      );
    elsif question.question_type = 'multiple_choice' then
      select coalesce(array_agg(option_id.value::uuid), array[]::uuid[])
        into value_as_option_ids
      from jsonb_array_elements_text(answer -> 'selected_option_ids') as option_id(value);

      insert into public.survey_answers (
        selected_option_id,
        survey_question_id,
        survey_submission_id
      )
      select
        selected_option.id,
        question.id,
        target_submission_id
      from unnest(value_as_option_ids) as selected_option(id);
    else
      insert into public.survey_answers (
        survey_question_id,
        survey_submission_id,
        text_value
      ) values (
        question.id,
        target_submission_id,
        btrim(answer ->> 'text_value')
      );
    end if;
  end loop;

  update public.survey_submissions survey_submission
  set
    status = 'submitted',
    submitted_at = greatest(now(), survey_submission.opened_at)
  where survey_submission.id = target_submission_id;

  return target_submission_id;
end;
$$;

revoke all on function public.submit_reader_survey(uuid, uuid, jsonb)
from public, anon;
grant execute on function public.submit_reader_survey(uuid, uuid, jsonb)
to authenticated;
