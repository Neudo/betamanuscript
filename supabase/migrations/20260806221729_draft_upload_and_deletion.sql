-- Allow a new draft to start from an imported source file without changing the
-- existing clone RPC used by already-deployed clients.
create function public.create_manuscript_draft_version_from_source(
  p_source_version_id uuid,
  p_imported_chapters jsonb
)
returns table (
  manuscript_version_id uuid,
  reading_round_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  source_version public.manuscript_versions%rowtype;
  source_round public.reading_rounds%rowtype;
  created_version_id uuid;
  created_round_id uuid;
  created_chapter_id uuid;
  next_version_number integer;
  imported_chapter jsonb;
  imported_blocks jsonb;
  imported_block jsonb;
  chapter_count integer;
  chapter_position integer;
  block_position integer;
  imported_block_count integer := 0;
  imported_character_count integer := 0;
  chapter_title text;
  block_content text;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to create a draft version.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_imported_chapters) <> 'array' then
    raise exception 'Imported chapters must be an array.' using errcode = '22023';
  end if;

  chapter_count := jsonb_array_length(p_imported_chapters);
  if chapter_count < 1 or chapter_count > 200 then
    raise exception 'An imported manuscript must contain between 1 and 200 chapters.' using errcode = '22023';
  end if;

  select manuscript_version.*
  into source_version
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_source_version_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of manuscript_version, manuscript;

  if not found then
    raise exception 'This active manuscript version could not be found.' using errcode = 'P0002';
  end if;

  select coalesce(max(manuscript_version.version_number), 0) + 1
  into next_version_number
  from public.manuscript_versions manuscript_version
  where manuscript_version.manuscript_id = source_version.manuscript_id;

  insert into public.manuscript_versions (
    manuscript_id,
    version_number,
    title,
    logline,
    estimated_word_count_band,
    status,
    created_by
  )
  values (
    source_version.manuscript_id,
    next_version_number,
    source_version.title,
    source_version.logline,
    source_version.estimated_word_count_band,
    'draft',
    current_profile_id
  )
  returning id into created_version_id;

  insert into public.manuscript_version_genres (
    manuscript_version_id,
    genre_slug,
    sort_order
  )
  select
    created_version_id,
    source_genre.genre_slug,
    source_genre.sort_order
  from public.manuscript_version_genres source_genre
  where source_genre.manuscript_version_id = source_version.id
  order by source_genre.sort_order;

  for chapter_position in 0..chapter_count - 1 loop
    imported_chapter := p_imported_chapters -> chapter_position;
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
    for imported_block in
      select value from jsonb_array_elements(imported_blocks)
    loop
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

      if imported_block ->> 'kind' <> 'paragraph' then
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
        'paragraph',
        block_content
      );

      block_position := block_position + 1;
    end loop;
  end loop;

  select reading_round.*
  into source_round
  from public.reading_rounds reading_round
  where reading_round.manuscript_version_id = source_version.id
    and reading_round.status <> 'archived'
  order by reading_round.created_at desc
  limit 1;

  if found then
    insert into public.reading_rounds (
      manuscript_version_id,
      name,
      status,
      access_mode,
      max_readers,
      reading_deadline,
      reader_note,
      welcome_message,
      show_author_profile,
      reader_closing_note
    )
    values (
      created_version_id,
      source_round.name,
      'draft',
      source_round.access_mode,
      source_round.max_readers,
      source_round.reading_deadline,
      source_round.reader_note,
      source_round.welcome_message,
      source_round.show_author_profile,
      source_round.reader_closing_note
    )
    returning id into created_round_id;
  else
    insert into public.reading_rounds (manuscript_version_id)
    values (created_version_id)
    returning id into created_round_id;
  end if;

  return query
  select created_version_id, created_round_id;
end;
$$;

revoke all on function public.create_manuscript_draft_version_from_source(uuid, jsonb) from public, anon;
grant execute on function public.create_manuscript_draft_version_from_source(uuid, jsonb) to authenticated, service_role;

-- Deleting one draft must remove records that deliberately use RESTRICT
-- foreign keys, while preserving the manuscript and its other draft versions.
create function public.delete_manuscript_draft_version(
  p_manuscript_version_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  target_version public.manuscript_versions%rowtype;
  remaining_active_draft_count integer;
  deleted_version_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to delete a draft version.' using errcode = '42501';
  end if;

  select manuscript_version.*
  into target_version
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_manuscript_version_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of manuscript_version, manuscript;

  if not found then
    raise exception 'This draft is no longer available.' using errcode = 'P0002';
  end if;

  select count(*)
  into remaining_active_draft_count
  from public.manuscript_versions manuscript_version
  where manuscript_version.manuscript_id = target_version.manuscript_id
    and manuscript_version.archived_at is null
    and manuscript_version.id <> target_version.id;

  if remaining_active_draft_count = 0 then
    raise exception 'A manuscript must keep one draft. Delete the manuscript instead.' using errcode = '22023';
  end if;

  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  delete from public.annotations annotation
  using public.manuscript_chapters chapter
  where annotation.chapter_id = chapter.id
    and chapter.manuscript_version_id = target_version.id;

  delete from public.survey_submissions submission
  using public.surveys survey,
        public.reading_rounds reading_round
  where submission.survey_id = survey.id
    and survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = target_version.id;

  delete from public.surveys survey
  using public.reading_rounds reading_round
  where survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = target_version.id;

  delete from public.pending_public_feedback pending_feedback
  using public.reading_round_access_links access_link,
        public.reading_rounds reading_round
  where pending_feedback.public_link_id = access_link.id
    and access_link.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = target_version.id;

  delete from public.manuscript_versions manuscript_version
  where manuscript_version.id = target_version.id
  returning manuscript_version.id into deleted_version_id;

  if deleted_version_id is null then
    raise exception 'This draft could not be deleted.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_manuscript_draft_version(uuid) from public, anon;
grant execute on function public.delete_manuscript_draft_version(uuid) to authenticated, service_role;
