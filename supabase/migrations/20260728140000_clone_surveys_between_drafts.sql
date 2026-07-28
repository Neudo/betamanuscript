-- Copying surveys is a manuscript-level operation: source and target must be
-- drafts of the same manuscript, while responses never cross draft boundaries.

create function public.clone_manuscript_surveys(
  p_target_manuscript_version_id uuid,
  p_source_survey_ids uuid[]
)
returns table (survey_id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  target_manuscript_id uuid;
  target_round_id uuid;
  target_chapter_id uuid;
  requested_source_ids uuid[];
  source_survey_count integer;
  source_survey record;
  source_question record;
  created_survey_id uuid;
  created_question_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to clone surveys.' using errcode = '42501';
  end if;

  if coalesce(cardinality(p_source_survey_ids), 0) = 0 then
    return;
  end if;

  select array_agg(distinct source_survey_id)
  into requested_source_ids
  from unnest(p_source_survey_ids) as source_survey_id;

  select manuscript_version.manuscript_id
  into target_manuscript_id
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_target_manuscript_version_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of manuscript_version, manuscript;

  if target_manuscript_id is null then
    raise exception 'This target draft does not exist or is not yours.' using errcode = '42501';
  end if;

  select reading_round.id
  into target_round_id
  from public.reading_rounds reading_round
  where reading_round.manuscript_version_id = p_target_manuscript_version_id
    and reading_round.status <> 'archived'
  order by reading_round.created_at desc
  limit 1
  for update of reading_round;

  if target_round_id is null then
    raise exception 'This target draft does not have an active reading round.' using errcode = '22023';
  end if;

  select count(*)
  into source_survey_count
  from public.surveys survey
  join public.reading_rounds source_round
    on source_round.id = survey.reading_round_id
  join public.manuscript_versions source_version
    on source_version.id = source_round.manuscript_version_id
  where survey.id = any(requested_source_ids)
    and source_version.manuscript_id = target_manuscript_id
    and source_version.id <> p_target_manuscript_version_id;

  if source_survey_count <> cardinality(requested_source_ids) then
    raise exception 'Every survey must belong to another draft of this manuscript.' using errcode = '42501';
  end if;

  for source_survey in
    select
      survey.id,
      survey.name,
      survey.trigger_type,
      source_chapter.position as chapter_position
    from public.surveys survey
    join public.reading_rounds source_round
      on source_round.id = survey.reading_round_id
    join public.manuscript_versions source_version
      on source_version.id = source_round.manuscript_version_id
    left join public.manuscript_chapters source_chapter
      on source_chapter.id = survey.chapter_id
    where survey.id = any(requested_source_ids)
      and source_version.manuscript_id = target_manuscript_id
      and source_version.id <> p_target_manuscript_version_id
    order by survey.created_at asc
  loop
    target_chapter_id := null;

    if source_survey.trigger_type = 'after_chapter' then
      select target_chapter.id
      into target_chapter_id
      from public.manuscript_chapters target_chapter
      where target_chapter.manuscript_version_id = p_target_manuscript_version_id
        and target_chapter.position = source_survey.chapter_position;

      if target_chapter_id is null then
        raise exception
          'Cannot clone survey "%": the target draft has no chapter %.',
          source_survey.name,
          source_survey.chapter_position
          using errcode = '22023';
      end if;
    end if;

    insert into public.surveys (
      reading_round_id,
      name,
      status,
      trigger_type,
      chapter_id
    )
    values (
      target_round_id,
      source_survey.name,
      'draft',
      source_survey.trigger_type,
      target_chapter_id
    )
    returning id into created_survey_id;

    for source_question in
      select
        survey_question.id,
        survey_question.position,
        survey_question.question_type,
        survey_question.prompt,
        survey_question.is_required
      from public.survey_questions survey_question
      where survey_question.survey_id = source_survey.id
      order by survey_question.position asc
    loop
      insert into public.survey_questions (
        survey_id,
        position,
        question_type,
        prompt,
        is_required
      )
      values (
        created_survey_id,
        source_question.position,
        source_question.question_type,
        source_question.prompt,
        source_question.is_required
      )
      returning id into created_question_id;

      insert into public.survey_question_options (
        survey_question_id,
        position,
        label
      )
      select
        created_question_id,
        survey_question_option.position,
        survey_question_option.label
      from public.survey_question_options survey_question_option
      where survey_question_option.survey_question_id = source_question.id
      order by survey_question_option.position asc;
    end loop;

    survey_id := created_survey_id;
    return next;
  end loop;
end;
$$;

revoke all on function public.clone_manuscript_surveys(uuid, uuid[]) from public, anon;
grant execute on function public.clone_manuscript_surveys(uuid, uuid[]) to authenticated;
