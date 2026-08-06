-- A draft can retain archived chapters and blocks after edits. Clone only the
-- live manuscript content; historical rows may reuse the same positions.

create or replace function public.create_manuscript_draft_version(
  p_source_version_id uuid
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
  source_chapter record;
  created_version_id uuid;
  created_round_id uuid;
  created_chapter_id uuid;
  next_version_number integer;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to create a draft version.' using errcode = '42501';
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

  for source_chapter in
    select chapter.id, chapter.position, chapter.title, chapter.editorial_status
    from public.manuscript_chapters chapter
    where chapter.manuscript_version_id = source_version.id
      and chapter.archived_at is null
    order by chapter.position
  loop
    insert into public.manuscript_chapters (
      manuscript_version_id,
      position,
      title,
      editorial_status
    )
    values (
      created_version_id,
      source_chapter.position,
      source_chapter.title,
      source_chapter.editorial_status
    )
    returning id into created_chapter_id;

    insert into public.chapter_blocks (
      chapter_id,
      position,
      kind,
      content,
      rich_content
    )
    select
      created_chapter_id,
      source_block.position,
      source_block.kind,
      source_block.content,
      source_block.rich_content
    from public.chapter_blocks source_block
    where source_block.chapter_id = source_chapter.id
      and source_block.archived_at is null
    order by source_block.position;
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
