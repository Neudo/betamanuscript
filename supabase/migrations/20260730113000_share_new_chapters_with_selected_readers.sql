-- A writer can append a new chapter to a shared draft without changing any
-- existing reader-visible text. The chapter remains private unless explicit
-- reader assignments are selected in the same transaction.

grant insert on table public.reader_assignment_chapter_access to authenticated;

create policy "Authors can grant reader chapter access"
on public.reader_assignment_chapter_access
for insert
to authenticated
with check (
  exists (
    select 1
    from public.reader_assignments reader_assignment
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_chapters chapter
      on chapter.id = reader_assignment_chapter_access.chapter_id
      and chapter.manuscript_version_id = reading_round.manuscript_version_id
    where reader_assignment.id = reader_assignment_chapter_access.reader_assignment_id
      and private.is_round_owner(reader_assignment.reading_round_id)
  )
);

create or replace function private.prevent_shared_block_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_chapter_id uuid;
begin
  if tg_op = 'DELETE' then
    target_chapter_id := old.chapter_id;
  else
    target_chapter_id := new.chapter_id;
  end if;

  if exists (
    select 1
    from public.manuscript_chapters chapter
    join public.reading_rounds reading_round
      on reading_round.manuscript_version_id = chapter.manuscript_version_id
    where chapter.id = target_chapter_id
      and reading_round.status in ('open', 'closed')
  ) and (
    tg_op <> 'INSERT'
    or exists (
      select 1
      from public.reader_assignment_chapter_access chapter_access
      where chapter_access.chapter_id = target_chapter_id
    )
  ) then
    raise exception 'Create a new manuscript version instead of changing text already shared with readers.';
  end if;

  return coalesce(new, old);
end;
$$;

drop function public.create_manuscript_chapter(uuid, text, text);

create function public.create_manuscript_chapter(
  p_manuscript_version_id uuid,
  p_title text,
  p_content text default '',
  p_reader_assignment_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_title text := nullif(btrim(p_title), '');
  normalized_reader_assignment_ids uuid[] := coalesce(p_reader_assignment_ids, '{}'::uuid[]);
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

  if cardinality(normalized_reader_assignment_ids) <> (
    select count(distinct requested.reader_assignment_id)
    from unnest(normalized_reader_assignment_ids) as requested(reader_assignment_id)
  ) then
    raise exception 'Each reader can only be selected once.' using errcode = '22023';
  end if;

  perform 1
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
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
    from unnest(normalized_reader_assignment_ids) as requested(reader_assignment_id)
    left join public.reader_assignments reader_assignment
      on reader_assignment.id = requested.reader_assignment_id
    left join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
      and reading_round.manuscript_version_id = p_manuscript_version_id
      and reading_round.status <> 'archived'
    where reader_assignment.status not in ('pending', 'started', 'completed')
      or reading_round.id is null
  ) then
    raise exception 'Each selected reader must have access to this active draft.' using errcode = '22023';
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

  insert into public.reader_assignment_chapter_access (
    reader_assignment_id,
    chapter_id
  )
  select requested.reader_assignment_id, chapter_id
  from unnest(normalized_reader_assignment_ids) as requested(reader_assignment_id);

  return chapter_id;
end;
$$;

revoke all on function public.create_manuscript_chapter(uuid, text, text, uuid[])
from public, anon;
grant execute on function public.create_manuscript_chapter(uuid, text, text, uuid[])
to authenticated;
