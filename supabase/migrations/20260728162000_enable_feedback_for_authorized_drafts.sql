-- Draft access is the reader-feedback permission. A reading round's draft,
-- open, or closed status must not add a second gate once access is granted.

create or replace function private.can_assignment_access_chapter(
  p_reader_assignment_id uuid,
  p_chapter_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reader_assignments reader_assignment
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_chapters chapter
      on chapter.manuscript_version_id = reading_round.manuscript_version_id
    where reader_assignment.id = p_reader_assignment_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
      and chapter.id = p_chapter_id
  );
$$;

create or replace function private.can_assignment_answer_survey(
  p_reader_assignment_id uuid,
  p_survey_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.reader_assignments reader_assignment
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.surveys survey
      on survey.reading_round_id = reader_assignment.reading_round_id
    where reader_assignment.id = p_reader_assignment_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
      and survey.id = p_survey_id
      and survey.status = 'active'
      and (
        (
          survey.trigger_type = 'after_chapter'
          and exists (
            select 1
            from public.chapter_reading_progress chapter_progress
            where chapter_progress.reader_assignment_id = reader_assignment.id
              and chapter_progress.chapter_id = survey.chapter_id
              and chapter_progress.status = 'completed'
          )
        )
        or (
          survey.trigger_type = 'after_manuscript'
          and not exists (
            select 1
            from public.manuscript_chapters chapter
            where chapter.manuscript_version_id = reading_round.manuscript_version_id
              and not exists (
                select 1
                from public.chapter_reading_progress chapter_progress
                where chapter_progress.reader_assignment_id = reader_assignment.id
                  and chapter_progress.chapter_id = chapter.id
                  and chapter_progress.status = 'completed'
              )
          )
        )
      )
  );
$$;
