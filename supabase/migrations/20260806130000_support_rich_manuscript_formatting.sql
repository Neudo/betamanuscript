-- Keeps rich typography beside the canonical plain text used for feedback
-- anchors. The two representations must always describe the same text.

create or replace function private.plain_manuscript_rich_content(p_content text)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'version', 1,
    'runs',
    case
      when coalesce(p_content, '') = '' then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object('text', p_content))
    end
  );
$$;

create or replace function private.is_valid_manuscript_rich_content(
  p_content text,
  p_rich_content jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  run jsonb;
  marks jsonb;
  joined_content text := '';
  mark_key text;
  font_size numeric;
  font_family text;
begin
  if p_rich_content is null
    or jsonb_typeof(p_rich_content) <> 'object'
    or p_rich_content -> 'version' <> '1'::jsonb
    or jsonb_typeof(p_rich_content -> 'runs') <> 'array' then
    return false;
  end if;

  for run in
    select value
    from jsonb_array_elements(p_rich_content -> 'runs')
  loop
    if jsonb_typeof(run) <> 'object'
      or jsonb_typeof(run -> 'text') <> 'string' then
      return false;
    end if;

    joined_content := joined_content || (run ->> 'text');
    if char_length(joined_content) > 25000 then
      return false;
    end if;

    if not run ? 'marks' then
      continue;
    end if;

    marks := run -> 'marks';
    if jsonb_typeof(marks) <> 'object' then
      return false;
    end if;

    for mark_key in
      select key
      from jsonb_object_keys(marks) as key
    loop
      if mark_key not in (
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'fontFamily',
        'fontSize',
        'color'
      ) then
        return false;
      end if;
    end loop;

    if (marks ? 'bold' and marks -> 'bold' <> 'true'::jsonb)
      or (marks ? 'italic' and marks -> 'italic' <> 'true'::jsonb)
      or (marks ? 'underline' and marks -> 'underline' <> 'true'::jsonb)
      or (marks ? 'strikethrough' and marks -> 'strikethrough' <> 'true'::jsonb) then
      return false;
    end if;

    if marks ? 'fontFamily' then
      font_family := marks ->> 'fontFamily';
      if jsonb_typeof(marks -> 'fontFamily') <> 'string'
        or char_length(font_family) > 80
        or font_family !~ '^[[:alnum:]][[:alnum:] .''-]*$' then
        return false;
      end if;
    end if;

    if marks ? 'fontSize' then
      if jsonb_typeof(marks -> 'fontSize') <> 'number' then
        return false;
      end if;

      font_size := (marks ->> 'fontSize')::numeric;
      if font_size < 6 or font_size > 72 or trunc(font_size) <> font_size then
        return false;
      end if;
    end if;

    if marks ? 'color'
      and (
        jsonb_typeof(marks -> 'color') <> 'string'
        or marks ->> 'color' !~ '^#[0-9A-Fa-f]{6}$'
      ) then
      return false;
    end if;
  end loop;

  return joined_content = coalesce(p_content, '');
end;
$$;

alter table public.chapter_blocks
  add column rich_content jsonb;

select set_config('app.allow_manuscript_chapter_mutation', 'on', true);

update public.chapter_blocks
set rich_content = private.plain_manuscript_rich_content(content);

alter table public.chapter_blocks
  alter column rich_content set default '{"version": 1, "runs": []}'::jsonb,
  alter column rich_content set not null;

create or replace function private.ensure_chapter_block_rich_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.rich_content is null
    or (
      new.rich_content = '{"version": 1, "runs": []}'::jsonb
      and new.content <> ''
    ) then
    new.rich_content := private.plain_manuscript_rich_content(new.content);
  end if;

  return new;
end;
$$;

create trigger chapter_blocks_ensure_rich_content
before insert or update of content, rich_content on public.chapter_blocks
for each row execute procedure private.ensure_chapter_block_rich_content();

alter table public.chapter_blocks
  add constraint chapter_blocks_rich_content_matches_content
  check (private.is_valid_manuscript_rich_content(content, rich_content));

create or replace function public.set_manuscript_chapter_rich_content(
  p_chapter_id uuid,
  p_blocks jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  block_record record;
  input_block jsonb;
  input_rich_content jsonb;
  input_index integer := 0;
  expected_block_count integer;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to format a chapter.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_blocks) <> 'array' then
    raise exception 'Chapter formatting must contain an array of blocks.' using errcode = '22023';
  end if;

  perform 1
  from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = p_chapter_id
    and chapter.archived_at is null
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of chapter;

  if not found then
    raise exception 'This active chapter could not be found.' using errcode = 'P0002';
  end if;

  select count(*)
  into expected_block_count
  from public.chapter_blocks block
  where block.chapter_id = p_chapter_id
    and block.archived_at is null;

  if jsonb_array_length(p_blocks) <> expected_block_count then
    raise exception 'Formatting must match the current chapter paragraphs.' using errcode = '22023';
  end if;

  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  for block_record in
    select block.id, block.content
    from public.chapter_blocks block
    where block.chapter_id = p_chapter_id
      and block.archived_at is null
    order by block.position
    for update
  loop
    input_block := p_blocks -> input_index;
    input_index := input_index + 1;

    if jsonb_typeof(input_block) <> 'object'
      or jsonb_typeof(input_block -> 'content') <> 'string'
      or input_block ->> 'content' <> block_record.content then
      raise exception 'Formatting cannot alter the chapter text.' using errcode = '22023';
    end if;

    input_rich_content := input_block -> 'rich_content';
    if not private.is_valid_manuscript_rich_content(block_record.content, input_rich_content) then
      raise exception 'Chapter formatting is invalid.' using errcode = '22023';
    end if;

    update public.chapter_blocks
    set rich_content = input_rich_content
    where id = block_record.id;
  end loop;
end;
$$;

create or replace function public.set_manuscript_version_rich_content(
  p_manuscript_version_id uuid,
  p_chapters jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  chapter_record record;
  input_chapter jsonb;
  input_index integer := 0;
  expected_chapter_count integer;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to format a manuscript.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_chapters) <> 'array' then
    raise exception 'Manuscript formatting must contain an array of chapters.' using errcode = '22023';
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
    raise exception 'This active manuscript draft could not be found.' using errcode = 'P0002';
  end if;

  select count(*)
  into expected_chapter_count
  from public.manuscript_chapters chapter
  where chapter.manuscript_version_id = p_manuscript_version_id
    and chapter.archived_at is null;

  if jsonb_array_length(p_chapters) <> expected_chapter_count then
    raise exception 'Formatting must match the current manuscript chapters.' using errcode = '22023';
  end if;

  for chapter_record in
    select chapter.id
    from public.manuscript_chapters chapter
    where chapter.manuscript_version_id = p_manuscript_version_id
      and chapter.archived_at is null
    order by chapter.position
  loop
    input_chapter := p_chapters -> input_index;
    input_index := input_index + 1;

    if jsonb_typeof(input_chapter) <> 'object'
      or jsonb_typeof(input_chapter -> 'blocks') <> 'array' then
      raise exception 'Each formatted chapter must contain blocks.' using errcode = '22023';
    end if;

    perform public.set_manuscript_chapter_rich_content(
      chapter_record.id,
      input_chapter -> 'blocks'
    );
  end loop;
end;
$$;

revoke all on function public.set_manuscript_chapter_rich_content(uuid, jsonb) from public, anon;
revoke all on function public.set_manuscript_version_rich_content(uuid, jsonb) from public, anon;
grant execute on function public.set_manuscript_chapter_rich_content(uuid, jsonb) to authenticated;
grant execute on function public.set_manuscript_version_rich_content(uuid, jsonb) to authenticated;
