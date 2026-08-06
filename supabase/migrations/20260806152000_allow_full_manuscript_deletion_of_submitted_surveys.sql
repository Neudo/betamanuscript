-- A confirmed manuscript deletion also removes survey responses. Keep regular
-- survey editing immutable once readers have seen it, while allowing the
-- transaction-scoped manuscript-purge capability to remove the whole graph.

create or replace function private.prevent_survey_definition_mutation_after_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_survey_id uuid;
begin
  if current_setting('app.allow_manuscript_full_deletion', true) = 'on' then
    return coalesce(new, old);
  end if;

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

  return coalesce(new, old);
end;
$$;

create or replace function public.delete_manuscript(p_manuscript_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  deleted_manuscript_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to delete a manuscript.' using errcode = '42501';
  end if;

  perform 1
  from public.manuscripts manuscript
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = current_profile_id
  for update;

  if not found then
    raise exception 'This manuscript could not be found.' using errcode = 'P0002';
  end if;

  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  update public.annotations annotation
  set archived_at = now()
  from public.manuscript_chapters chapter,
       public.manuscript_versions manuscript_version
  where annotation.chapter_id = chapter.id
    and chapter.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id
    and annotation.archived_at is null;

  delete from public.annotations annotation
  using public.manuscript_chapters chapter,
        public.manuscript_versions manuscript_version
  where annotation.chapter_id = chapter.id
    and chapter.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.surveys survey
  using public.reading_rounds reading_round,
        public.manuscript_versions manuscript_version
  where survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.manuscripts manuscript
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = current_profile_id
  returning manuscript.id into deleted_manuscript_id;

  if deleted_manuscript_id is null then
    raise exception 'This manuscript could not be deleted.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_manuscript(uuid) from public, anon;
grant execute on function public.delete_manuscript(uuid) to authenticated;
