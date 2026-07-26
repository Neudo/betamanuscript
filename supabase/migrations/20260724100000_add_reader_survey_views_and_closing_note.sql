-- A closing note belongs to the reading round: readers can access it without
-- exposing the manuscript owner's private root record, and it is configured
-- alongside the rest of their reading experience.
alter table public.reading_rounds
  add column reader_closing_note text
  check (
    reader_closing_note is null
    or char_length(reader_closing_note) <= 4000
  );

-- Create the initial round, including the optional note shown after the last
-- chapter. This function keeps using the caller's RLS permissions.
create or replace function public.create_manuscript_from_draft(p_draft jsonb)
returns table (
  manuscript_id uuid,
  manuscript_version_id uuid,
  reading_round_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  created_manuscript_id uuid;
  created_version_id uuid;
  created_round_id uuid;
  created_chapter_id uuid;
  title text := nullif(btrim(p_draft ->> 'title'), '');
  logline text := nullif(btrim(p_draft ->> 'logline'), '');
  reader_note text := nullif(btrim(p_draft ->> 'reader_note'), '');
  reader_closing_note text := nullif(btrim(p_draft ->> 'reader_closing_note'), '');
  version_number integer := coalesce((p_draft ->> 'draft_number')::integer, 1);
  chapter_count integer := coalesce((p_draft ->> 'chapter_count')::integer, 1);
  max_readers integer := coalesce((p_draft ->> 'max_readers')::integer, 5);
  reading_deadline date := nullif(p_draft ->> 'reading_deadline', '')::date;
  imported_chapters jsonb := p_draft -> 'chapters';
  imported_chapter jsonb;
  imported_blocks jsonb;
  imported_block jsonb;
  imported_block_count integer := 0;
  imported_character_count integer := 0;
  chapter_position integer;
  block_position integer;
  chapter_title text;
  block_content text;
  block_kind public.chapter_block_kind;
  word_count_band public.word_count_band;
  access_mode public.reading_access_mode;
  genre_slugs text[];
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to create a manuscript.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_draft) <> 'object' then
    raise exception 'The manuscript draft must be a JSON object.' using errcode = '22023';
  end if;

  if imported_chapters is not null then
    if jsonb_typeof(imported_chapters) <> 'array' then
      raise exception 'Imported chapters must be an array.' using errcode = '22023';
    end if;

    chapter_count := jsonb_array_length(imported_chapters);
  end if;

  if title is null or char_length(title) > 300 then
    raise exception 'The title must contain between 1 and 300 characters.' using errcode = '22023';
  end if;

  if logline is not null and char_length(logline) > 2000 then
    raise exception 'The logline cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  if reader_note is not null and char_length(reader_note) > 4000 then
    raise exception 'The reader note cannot exceed 4000 characters.' using errcode = '22023';
  end if;

  if reader_closing_note is not null and char_length(reader_closing_note) > 4000 then
    raise exception 'The closing note cannot exceed 4000 characters.' using errcode = '22023';
  end if;

  if version_number < 1 then
    raise exception 'The draft number must be greater than zero.' using errcode = '22023';
  end if;

  if chapter_count < 1 or chapter_count > 200 then
    raise exception 'The chapter count must be between 1 and 200.' using errcode = '22023';
  end if;

  if max_readers < 1 then
    raise exception 'The reader limit must be greater than zero.' using errcode = '22023';
  end if;

  if p_draft ? 'word_count_band' and nullif(p_draft ->> 'word_count_band', '') is not null then
    word_count_band := (p_draft ->> 'word_count_band')::public.word_count_band;
  end if;

  if p_draft ->> 'access_mode' = 'open_signup' then
    access_mode := 'open_signup'::public.reading_access_mode;
  elsif p_draft ->> 'access_mode' = 'invite_only' then
    access_mode := 'invite_only'::public.reading_access_mode;
  else
    raise exception 'The access mode is invalid.' using errcode = '22023';
  end if;

  select coalesce(array_agg(value order by ordinality), array[]::text[])
    into genre_slugs
  from jsonb_array_elements_text(coalesce(p_draft -> 'genre_slugs', '[]'::jsonb)) with ordinality;

  if cardinality(genre_slugs) <> cardinality(array(select distinct unnest(genre_slugs))) then
    raise exception 'A genre can only be selected once.' using errcode = '22023';
  end if;

  if (
    select count(*)
    from public.genres
    where is_active and slug = any (genre_slugs)
  ) <> cardinality(genre_slugs) then
    raise exception 'One or more selected genres are invalid.' using errcode = '22023';
  end if;

  insert into public.manuscripts (owner_id, internal_title)
  values (current_profile_id, title)
  returning id into created_manuscript_id;

  insert into public.manuscript_versions (
    manuscript_id,
    version_number,
    title,
    logline,
    estimated_word_count_band,
    created_by
  )
  values (
    created_manuscript_id,
    version_number,
    title,
    logline,
    word_count_band,
    current_profile_id
  )
  returning id into created_version_id;

  insert into public.manuscript_version_genres (
    manuscript_version_id,
    genre_slug,
    sort_order
  )
  select created_version_id, genre_slug, position::smallint
  from unnest(genre_slugs) with ordinality as selected(genre_slug, position);

  if imported_chapters is null then
    insert into public.manuscript_chapters (
      manuscript_version_id,
      position,
      title
    )
    select created_version_id, position, 'Chapter ' || position
    from generate_series(1, chapter_count) as position;
  else
    for chapter_position in 0..chapter_count - 1 loop
      imported_chapter := imported_chapters -> chapter_position;
      if jsonb_typeof(imported_chapter) <> 'object' then
        raise exception 'Each imported chapter must be an object.' using errcode = '22023';
      end if;

      chapter_title := nullif(btrim(imported_chapter ->> 'title'), '');
      if chapter_title is null or char_length(chapter_title) > 500 then
        raise exception 'Each imported chapter title must contain between 1 and 500 characters.' using errcode = '22023';
      end if;

      imported_blocks := coalesce(imported_chapter -> 'blocks', '[]'::jsonb);
      if jsonb_typeof(imported_blocks) <> 'array' then
        raise exception 'Each imported chapter blocks field must be an array.' using errcode = '22023';
      end if;

      insert into public.manuscript_chapters (
        manuscript_version_id,
        position,
        title
      )
      values (
        created_version_id,
        chapter_position + 1,
        chapter_title
      )
      returning id into created_chapter_id;

      block_position := 1;
      for imported_block in select value from jsonb_array_elements(imported_blocks) loop
        imported_block_count := imported_block_count + 1;
        if imported_block_count > 5000 then
          raise exception 'An imported manuscript cannot contain more than 5,000 blocks.' using errcode = '22023';
        end if;

        if jsonb_typeof(imported_block) <> 'object' then
          raise exception 'Each imported block must be an object.' using errcode = '22023';
        end if;

        block_content := nullif(btrim(imported_block ->> 'content'), '');
        if block_content is null or char_length(block_content) > 25000 then
          raise exception 'Each imported block must contain between 1 and 25,000 characters.' using errcode = '22023';
        end if;

        imported_character_count := imported_character_count + char_length(block_content);
        if imported_character_count > 1000000 then
          raise exception 'An imported manuscript cannot exceed 1,000,000 characters.' using errcode = '22023';
        end if;

        if imported_block ->> 'kind' = 'paragraph' then
          block_kind := 'paragraph'::public.chapter_block_kind;
        else
          raise exception 'Imported blocks must use the paragraph kind.' using errcode = '22023';
        end if;

        insert into public.chapter_blocks (
          chapter_id,
          position,
          kind,
          content
        )
        values (
          created_chapter_id,
          block_position,
          block_kind,
          block_content
        );

        block_position := block_position + 1;
      end loop;
    end loop;
  end if;

  insert into public.reading_rounds (
    manuscript_version_id,
    access_mode,
    max_readers,
    reading_deadline,
    reader_note,
    reader_closing_note
  )
  values (
    created_version_id,
    access_mode,
    max_readers,
    reading_deadline,
    reader_note,
    reader_closing_note
  )
  returning id into created_round_id;

  return query
  select created_manuscript_id, created_version_id, created_round_id;
end;
$$;

revoke all on function public.create_manuscript_from_draft(jsonb)
from public, anon;
grant execute on function public.create_manuscript_from_draft(jsonb)
to authenticated;

-- Add the optional closing note to the existing settings operation. Dropping
-- the old signature avoids ambiguous PostgREST RPC overloads.
drop function public.update_manuscript_settings(uuid, text, text);

create function public.update_manuscript_settings(
  p_manuscript_id uuid,
  p_title text,
  p_logline text,
  p_reader_closing_note text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_title text := nullif(btrim(p_title), '');
  normalized_logline text := nullif(btrim(p_logline), '');
  normalized_closing_note text := nullif(btrim(p_reader_closing_note), '');
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to update a manuscript.' using errcode = '42501';
  end if;

  if normalized_title is null or char_length(normalized_title) > 300 then
    raise exception 'The title must contain between 1 and 300 characters.' using errcode = '22023';
  end if;

  if normalized_logline is not null and char_length(normalized_logline) > 2000 then
    raise exception 'The logline cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  if normalized_closing_note is not null and char_length(normalized_closing_note) > 4000 then
    raise exception 'The closing note cannot exceed 4000 characters.' using errcode = '22023';
  end if;

  update public.manuscripts manuscript
  set internal_title = normalized_title
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = current_profile_id
    and manuscript.archived_at is null;

  if not found then
    raise exception 'This manuscript could not be found.' using errcode = 'P0002';
  end if;

  update public.manuscript_versions manuscript_version
  set
    title = normalized_title,
    logline = normalized_logline
  where manuscript_version.id = (
    select active_version.id
    from public.manuscript_versions active_version
    where active_version.manuscript_id = p_manuscript_id
      and active_version.archived_at is null
    order by active_version.version_number desc
    limit 1
  );

  if not found then
    raise exception 'This manuscript has no active version to update.' using errcode = 'P0002';
  end if;

  update public.reading_rounds reading_round
  set reader_closing_note = normalized_closing_note
  where reading_round.id = (
    select current_round.id
    from public.reading_rounds current_round
    join public.manuscript_versions active_version
      on active_version.id = current_round.manuscript_version_id
    where active_version.manuscript_id = p_manuscript_id
      and active_version.archived_at is null
      and current_round.status <> 'archived'
    order by active_version.version_number desc, current_round.created_at desc
    limit 1
  );

  if not found then
    raise exception 'This manuscript has no active reading round.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_manuscript_settings(uuid, text, text, text)
from public, anon;
grant execute on function public.update_manuscript_settings(uuid, text, text, text)
to authenticated;

-- A submission starts as `in_progress` the first time a reader sees a survey.
-- This is deliberately a separate operation from submitting answers, so a
-- reader who reloads cannot be prompted with the same survey again.
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
  on conflict (survey_id, reader_assignment_id) do nothing
  returning submission.survey_id;
end;
$$;

revoke all on function public.open_reader_surveys(uuid, uuid[])
from public, anon;
grant execute on function public.open_reader_surveys(uuid, uuid[])
to authenticated;

-- Once a reader has seen a survey, its definition must stay immutable: this
-- keeps every reader's response comparable to the same questions.
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
