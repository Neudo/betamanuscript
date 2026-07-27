-- Lets writers manage the chapter structure of an unshared draft in one
-- database operation. Existing triggers still prevent changes once readers
-- have access to the version.

create or replace function public.create_manuscript_chapter(
  p_manuscript_version_id uuid,
  p_title text,
  p_content text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_title text := nullif(btrim(p_title), '');
  chapter_id uuid;
  chapter_position integer;
  block_content text;
  block_position integer := 1;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to add a chapter.' using errcode = '42501';
  end if;

  if normalized_title is null or char_length(normalized_title) > 500 then
    raise exception 'The chapter title must contain between 1 and 500 characters.' using errcode = '22023';
  end if;

  if char_length(coalesce(p_content, '')) > 1000000 then
    raise exception 'A chapter cannot exceed 1,000,000 characters.' using errcode = '22023';
  end if;

  perform 1
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_manuscript_version_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of manuscript_version;

  if not found then
    raise exception 'This active manuscript version could not be found.' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = p_manuscript_version_id
      and reading_round.status in ('open', 'closed')
  ) then
    raise exception 'Create a new manuscript version instead of changing chapters already shared with readers.' using errcode = '55000';
  end if;

  select coalesce(max(chapter.position), 0) + 1
  into chapter_position
  from public.manuscript_chapters chapter
  where chapter.manuscript_version_id = p_manuscript_version_id;

  if chapter_position > 200 then
    raise exception 'A manuscript can contain at most 200 chapters.' using errcode = '22023';
  end if;

  insert into public.manuscript_chapters (manuscript_version_id, position, title)
  values (p_manuscript_version_id, chapter_position, normalized_title)
  returning id into chapter_id;

  for block_content in
    select nullif(btrim(value), '')
    from regexp_split_to_table(coalesce(p_content, ''), E'\\r?\\n[\\t ]*\\r?\\n+') as value
  loop
    continue when block_content is null;

    if char_length(block_content) > 25000 then
      raise exception 'Each paragraph must contain 25,000 characters or fewer.' using errcode = '22023';
    end if;

    insert into public.chapter_blocks (chapter_id, position, kind, content)
    values (chapter_id, block_position, 'paragraph', block_content);

    block_position := block_position + 1;
  end loop;

  return chapter_id;
end;
$$;

create or replace function public.update_manuscript_chapter(
  p_chapter_id uuid,
  p_title text,
  p_content text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_title text := nullif(btrim(p_title), '');
  chapter_version_id uuid;
  block_content text;
  block_position integer := 1;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to edit a chapter.' using errcode = '42501';
  end if;

  if normalized_title is null or char_length(normalized_title) > 500 then
    raise exception 'The chapter title must contain between 1 and 500 characters.' using errcode = '22023';
  end if;

  if char_length(coalesce(p_content, '')) > 1000000 then
    raise exception 'A chapter cannot exceed 1,000,000 characters.' using errcode = '22023';
  end if;

  select chapter.manuscript_version_id
  into chapter_version_id
  from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = p_chapter_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of chapter;

  if not found then
    raise exception 'This chapter could not be found.' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = chapter_version_id
      and reading_round.status in ('open', 'closed')
  ) or exists (
    select 1
    from public.annotations annotation
    where annotation.chapter_id = p_chapter_id
  ) then
    raise exception 'Create a new manuscript version instead of changing a chapter that has reader feedback.' using errcode = '55000';
  end if;

  update public.manuscript_chapters
  set title = normalized_title
  where id = p_chapter_id;

  delete from public.chapter_blocks
  where chapter_id = p_chapter_id;

  for block_content in
    select nullif(btrim(value), '')
    from regexp_split_to_table(coalesce(p_content, ''), E'\\r?\\n[\\t ]*\\r?\\n+') as value
  loop
    continue when block_content is null;

    if char_length(block_content) > 25000 then
      raise exception 'Each paragraph must contain 25,000 characters or fewer.' using errcode = '22023';
    end if;

    insert into public.chapter_blocks (chapter_id, position, kind, content)
    values (p_chapter_id, block_position, 'paragraph', block_content);

    block_position := block_position + 1;
  end loop;
end;
$$;

create or replace function public.delete_manuscript_chapter(p_chapter_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  chapter_version_id uuid;
  deleted_position integer;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to remove a chapter.' using errcode = '42501';
  end if;

  select chapter.manuscript_version_id, chapter.position
  into chapter_version_id, deleted_position
  from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = p_chapter_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of chapter;

  if not found then
    raise exception 'This chapter could not be found.' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = chapter_version_id
      and reading_round.status in ('open', 'closed')
  ) or exists (
    select 1
    from public.annotations annotation
    where annotation.chapter_id = p_chapter_id
  ) or exists (
    select 1
    from public.surveys survey
    where survey.chapter_id = p_chapter_id
  ) then
    raise exception 'This chapter has been shared with readers. Create a new manuscript version instead of deleting it.' using errcode = '55000';
  end if;

  delete from public.manuscript_chapters
  where id = p_chapter_id;

  update public.manuscript_chapters chapter
  set position = position - 1
  where chapter.manuscript_version_id = chapter_version_id
    and chapter.position > deleted_position;
end;
$$;

revoke all on function public.create_manuscript_chapter(uuid, text, text) from public, anon;
revoke all on function public.update_manuscript_chapter(uuid, text, text) from public, anon;
revoke all on function public.delete_manuscript_chapter(uuid) from public, anon;

grant execute on function public.create_manuscript_chapter(uuid, text, text) to authenticated;
grant execute on function public.update_manuscript_chapter(uuid, text, text) to authenticated;
grant execute on function public.delete_manuscript_chapter(uuid) to authenticated;
