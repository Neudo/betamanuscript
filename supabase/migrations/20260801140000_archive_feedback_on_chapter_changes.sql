-- Chapters can now evolve after reader feedback. Feedback whose selected text
-- no longer exists is kept as an author-only archive instead of being lost.

alter table public.manuscript_chapters
  add column if not exists archived_at timestamptz;

alter table public.chapter_blocks
  add column if not exists archived_at timestamptz;

alter table public.annotations
  add column if not exists archived_at timestamptz,
  add column if not exists archived_reason text;

alter table public.chapter_general_comments
  add column if not exists archived_at timestamptz,
  add column if not exists archived_reason text;

alter table public.annotations
  drop constraint if exists annotations_archived_reason_check,
  add constraint annotations_archived_reason_check
    check (archived_reason is null or archived_reason in ('text_changed', 'chapter_replaced', 'chapter_deleted'));

alter table public.chapter_general_comments
  drop constraint if exists chapter_general_comments_archived_reason_check,
  add constraint chapter_general_comments_archived_reason_check
    check (archived_reason is null or archived_reason in ('chapter_replaced', 'chapter_deleted'));

-- Historical blocks and deleted chapters retain their original positions. The
-- live draft is the only collection that must have contiguous positions.
alter table public.manuscript_chapters
  drop constraint if exists manuscript_chapters_manuscript_version_id_position_key;

alter table public.chapter_blocks
  drop constraint if exists chapter_blocks_chapter_id_position_key;

create unique index if not exists manuscript_chapters_active_version_position_key
  on public.manuscript_chapters (manuscript_version_id, position)
  where archived_at is null;

create unique index if not exists chapter_blocks_active_chapter_position_key
  on public.chapter_blocks (chapter_id, position)
  where archived_at is null;

create index if not exists annotations_active_chapter_created_idx
  on public.annotations (chapter_id, created_at desc)
  where archived_at is null;

create index if not exists annotations_archived_chapter_created_idx
  on public.annotations (chapter_id, created_at desc)
  where archived_at is not null;

create index if not exists chapter_general_comments_archived_chapter_created_idx
  on public.chapter_general_comments (chapter_id, created_at desc)
  where archived_at is not null;

-- Readers never regain access to a chapter or its feedback after the author
-- removes it. Authors retain access so archived feedback can be reviewed.
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
    from public.reader_assignment_chapter_access chapter_access
    join public.reader_assignments reader_assignment
      on reader_assignment.id = chapter_access.reader_assignment_id
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_chapters chapter
      on chapter.id = chapter_access.chapter_id
      and chapter.manuscript_version_id = reading_round.manuscript_version_id
      and chapter.archived_at is null
    where chapter_access.reader_assignment_id = p_reader_assignment_id
      and chapter_access.chapter_id = p_chapter_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
  );
$$;

create or replace function private.can_read_chapter(p_chapter_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reader_assignment_chapter_access chapter_access
    join public.reader_assignments reader_assignment
      on reader_assignment.id = chapter_access.reader_assignment_id
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_chapters chapter
      on chapter.id = chapter_access.chapter_id
      and chapter.manuscript_version_id = reading_round.manuscript_version_id
      and chapter.archived_at is null
    where chapter_access.chapter_id = p_chapter_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
  );
$$;

drop policy if exists "Owners and assigned readers can read chapters" on public.manuscript_chapters;
create policy "Owners and assigned readers can read chapters"
on public.manuscript_chapters
for select
to authenticated
using (
  private.is_manuscript_version_owner(manuscript_version_id)
  or (archived_at is null and private.can_read_chapter(id))
);

drop policy if exists "Owners and assigned readers can read chapter blocks" on public.chapter_blocks;
create policy "Owners and assigned readers can read chapter blocks"
on public.chapter_blocks
for select
to authenticated
using (
  (private.is_chapter_owner(chapter_id) or private.can_read_chapter(chapter_id))
  and archived_at is null
);

drop policy if exists "Chapter owners and readers can read annotations" on public.annotations;
create policy "Chapter owners and readers can read annotations"
on public.annotations
for select
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
);

drop policy if exists "Chapter owners and readers can read general comments" on public.chapter_general_comments;
create policy "Chapter owners and readers can read general comments"
on public.chapter_general_comments
for select
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
);

drop policy if exists "Chapter owners and readers can delete annotations" on public.annotations;
create policy "Chapter owners and readers can delete annotations"
on public.annotations
for delete
to authenticated
using (
  (private.is_chapter_owner(chapter_id) and archived_at is not null)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

drop policy if exists "Chapter owners and readers can delete general comments" on public.chapter_general_comments;
create policy "Chapter owners and readers can delete general comments"
on public.chapter_general_comments
for delete
to authenticated
using (
  (private.is_chapter_owner(chapter_id) and archived_at is not null)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

-- Direct mutations remain protected for shared chapters. The author-owned
-- RPCs below set a transaction-local capability before changing structure.
create or replace function private.prevent_shared_chapter_structure_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.allow_manuscript_chapter_mutation', true) = 'on' then
    return coalesce(new, old);
  end if;

  if exists (
    select 1
    from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = old.manuscript_version_id
      and reading_round.status in ('open', 'closed')
  ) and (
    tg_op = 'DELETE'
    or new.manuscript_version_id is distinct from old.manuscript_version_id
    or new.position is distinct from old.position
    or new.title is distinct from old.title
    or new.archived_at is distinct from old.archived_at
  ) then
    raise exception 'Use the chapter editor to change a chapter shared with readers.';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function private.prevent_shared_block_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_chapter_id uuid;
begin
  if current_setting('app.allow_manuscript_chapter_mutation', true) = 'on' then
    return coalesce(new, old);
  end if;

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
    raise exception 'Use the chapter editor to change text shared with readers.';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function private.prevent_reader_annotation_anchor_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_assignment_owner(old.reader_assignment_id)
    and (
      new.reader_assignment_id is distinct from old.reader_assignment_id
      or new.chapter_id is distinct from old.chapter_id
      or new.chapter_block_id is distinct from old.chapter_block_id
      or new.selection_end_chapter_block_id is distinct from old.selection_end_chapter_block_id
      or new.quote is distinct from old.quote
      or new.selection_start is distinct from old.selection_start
      or new.selection_end is distinct from old.selection_end
      or new.selection_end_offset is distinct from old.selection_end_offset
      or new.context_before is distinct from old.context_before
      or new.context_after is distinct from old.context_after
      or new.author_seen_at is distinct from old.author_seen_at
      or new.author_resolved_at is distinct from old.author_resolved_at
      or new.archived_at is distinct from old.archived_at
      or new.archived_reason is distinct from old.archived_reason
    )
  then
    raise exception 'Readers can only update an annotation tag or comment.';
  end if;

  if private.is_assignment_owner(old.reader_assignment_id)
    and new.tag_id is distinct from old.tag_id
    and not private.is_active_manuscript_tag_for_chapter(new.tag_id, new.chapter_id)
  then
    raise exception 'Choose an active tag for this manuscript.';
  end if;

  return new;
end;
$$;

create or replace function private.prevent_reader_general_comment_scope_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_assignment_owner(old.reader_assignment_id)
    and (
      new.reader_assignment_id is distinct from old.reader_assignment_id
      or new.chapter_id is distinct from old.chapter_id
      or new.author_seen_at is distinct from old.author_seen_at
      or new.archived_at is distinct from old.archived_at
      or new.archived_reason is distinct from old.archived_reason
    )
  then
    raise exception 'Readers can only update their general comment.';
  end if;

  return new;
end;
$$;

create or replace function public.create_manuscript_chapter(
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
  where chapter.manuscript_version_id = p_manuscript_version_id
    and chapter.archived_at is null;

  if chapter_position > 200 then
    raise exception 'A manuscript can contain at most 200 chapters.' using errcode = '22023';
  end if;

  insert into public.manuscript_chapters (manuscript_version_id, position, title)
  values (p_manuscript_version_id, chapter_position, normalized_title)
  returning id into chapter_id;

  for block_content in
    select nullif(btrim(value), '')
    from regexp_split_to_table(replace(replace(coalesce(p_content, ''), E'\r\n', E'\n'), E'\r', E'\n'), E'\n[\t ]*\n+') as value
  loop
    continue when block_content is null;

    if char_length(block_content) > 25000 then
      raise exception 'Each paragraph must contain 25,000 characters or fewer.' using errcode = '22023';
    end if;

    insert into public.chapter_blocks (chapter_id, position, kind, content)
    values (chapter_id, block_position, 'paragraph', block_content);

    block_position := block_position + 1;
  end loop;

  insert into public.reader_assignment_chapter_access (reader_assignment_id, chapter_id)
  select requested.reader_assignment_id, chapter_id
  from unnest(normalized_reader_assignment_ids) as requested(reader_assignment_id);

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
  normalized_input text := replace(replace(coalesce(p_content, ''), E'\r\n', E'\n'), E'\r', E'\n');
  current_content text;
  next_content text;
  next_blocks text[];
  block_content text;
  block_position integer := 1;
  active_annotation record;
  match_start integer;
  match_end integer;
  current_offset integer;
  start_block_position integer;
  end_block_position integer;
  start_offset integer;
  end_offset integer;
  start_block_id uuid;
  end_block_id uuid;
  is_complete_replacement boolean;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to edit a chapter.' using errcode = '42501';
  end if;

  if normalized_title is null or char_length(normalized_title) > 500 then
    raise exception 'The chapter title must contain between 1 and 500 characters.' using errcode = '22023';
  end if;

  if char_length(normalized_input) > 1000000 then
    raise exception 'A chapter cannot exceed 1,000,000 characters.' using errcode = '22023';
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
    raise exception 'This chapter could not be found.' using errcode = 'P0002';
  end if;

  select coalesce(array_agg(parsed.content order by parsed.ordinality), '{}'::text[])
  into next_blocks
  from (
    select ordinality, nullif(btrim(value), '') as content
    from regexp_split_to_table(normalized_input, E'\n[\t ]*\n+') with ordinality as split(value, ordinality)
  ) parsed
  where parsed.content is not null;

  foreach block_content in array next_blocks loop
    if char_length(block_content) > 25000 then
      raise exception 'Each paragraph must contain 25,000 characters or fewer.' using errcode = '22023';
    end if;
  end loop;

  next_content := coalesce(array_to_string(next_blocks, E'\n\n'), '');

  select coalesce(string_agg(block.content, E'\n\n' order by block.position), '')
  into current_content
  from public.chapter_blocks block
  where block.chapter_id = p_chapter_id
    and block.archived_at is null;

  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  update public.manuscript_chapters
  set title = normalized_title
  where id = p_chapter_id;

  if current_content = next_content then
    return;
  end if;

  -- An inline annotation remains active only when its selected quote still
  -- exists exactly in the revised chapter. It is re-anchored after new blocks
  -- are created; every other inline annotation becomes archived.
  update public.annotations annotation
  set
    archived_at = now(),
    archived_reason = 'text_changed'
  where annotation.chapter_id = p_chapter_id
    and annotation.archived_at is null
    and strpos(next_content, annotation.quote) = 0;

  select exists (
    select 1
    from public.chapter_blocks block
    where block.chapter_id = p_chapter_id
      and block.archived_at is null
      and block.content <> ''
  ) and not exists (
    select 1
    from public.chapter_blocks block
    where block.chapter_id = p_chapter_id
      and block.archived_at is null
      and block.content <> ''
      and strpos(next_content, block.content) > 0
  ) into is_complete_replacement;

  if is_complete_replacement then
    update public.chapter_general_comments general_comment
    set
      archived_at = now(),
      archived_reason = 'chapter_replaced'
    where general_comment.chapter_id = p_chapter_id
      and general_comment.archived_at is null;
  end if;

  update public.chapter_blocks
  set archived_at = now()
  where chapter_id = p_chapter_id
    and archived_at is null;

  foreach block_content in array next_blocks loop
    insert into public.chapter_blocks (chapter_id, position, kind, content)
    values (p_chapter_id, block_position, 'paragraph', block_content);
    block_position := block_position + 1;
  end loop;

  for active_annotation in
    select id, quote
    from public.annotations
    where chapter_id = p_chapter_id
      and archived_at is null
  loop
    match_start := strpos(next_content, active_annotation.quote);
    match_end := match_start + char_length(active_annotation.quote) - 1;
    current_offset := 1;
    start_block_position := null;
    end_block_position := null;
    start_offset := null;
    end_offset := null;

    for block_position in 1..coalesce(array_length(next_blocks, 1), 0) loop
      block_content := next_blocks[block_position];

      if start_block_position is null
        and match_start >= current_offset
        and match_start < current_offset + char_length(block_content) then
        start_block_position := block_position;
        start_offset := match_start - current_offset;
      end if;

      if match_end >= current_offset
        and match_end < current_offset + char_length(block_content) then
        end_block_position := block_position;
        end_offset := match_end - current_offset + 1;
        exit;
      end if;

      current_offset := current_offset + char_length(block_content) + 2;
    end loop;

    if start_block_position is null or end_block_position is null then
      update public.annotations
      set archived_at = now(), archived_reason = 'text_changed'
      where id = active_annotation.id;
      continue;
    end if;

    select id into start_block_id
    from public.chapter_blocks
    where chapter_id = p_chapter_id
      and archived_at is null
      and position = start_block_position;

    select id into end_block_id
    from public.chapter_blocks
    where chapter_id = p_chapter_id
      and archived_at is null
      and position = end_block_position;

    update public.annotations
    set
      chapter_block_id = start_block_id,
      selection_start = start_offset,
      selection_end = case when start_block_position = end_block_position then end_offset else char_length(next_blocks[start_block_position]) end,
      selection_end_chapter_block_id = case when start_block_position = end_block_position then null else end_block_id end,
      selection_end_offset = case when start_block_position = end_block_position then null else end_offset end
    where id = active_annotation.id;
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
  position_offset integer;
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
    and chapter.archived_at is null
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of chapter;

  if not found then
    raise exception 'This chapter could not be found.' using errcode = 'P0002';
  end if;

  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  update public.annotations
  set archived_at = now(), archived_reason = 'chapter_deleted'
  where chapter_id = p_chapter_id
    and archived_at is null;

  update public.chapter_general_comments
  set archived_at = now(), archived_reason = 'chapter_deleted'
  where chapter_id = p_chapter_id
    and archived_at is null;

  update public.chapter_blocks
  set archived_at = now()
  where chapter_id = p_chapter_id
    and archived_at is null;

  update public.manuscript_chapters
  set archived_at = now()
  where id = p_chapter_id;

  select coalesce(max(chapter.position), 0) + 1
  into position_offset
  from public.manuscript_chapters chapter
  where chapter.manuscript_version_id = chapter_version_id
    and chapter.archived_at is null;

  update public.manuscript_chapters chapter
  set position = position + position_offset
  where chapter.manuscript_version_id = chapter_version_id
    and chapter.archived_at is null
    and chapter.position > deleted_position;

  update public.manuscript_chapters chapter
  set position = position - position_offset - 1
  where chapter.manuscript_version_id = chapter_version_id
    and chapter.archived_at is null
    and chapter.position > position_offset + deleted_position;
end;
$$;

create or replace function public.delete_archived_feedback(
  p_feedback_id uuid,
  p_feedback_kind text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_feedback_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to remove archived feedback.' using errcode = '42501';
  end if;

  if p_feedback_kind = 'annotation' then
    delete from public.annotations
    where id = p_feedback_id
      and archived_at is not null
      and private.is_chapter_owner(chapter_id)
    returning id into deleted_feedback_id;
  elsif p_feedback_kind = 'general-comment' then
    delete from public.chapter_general_comments
    where id = p_feedback_id
      and archived_at is not null
      and private.is_chapter_owner(chapter_id)
    returning id into deleted_feedback_id;
  else
    raise exception 'The feedback kind is invalid.' using errcode = '22023';
  end if;

  if deleted_feedback_id is null then
    raise exception 'This archived feedback could not be found.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.create_manuscript_chapter(uuid, text, text, uuid[]) from public, anon;
revoke all on function public.update_manuscript_chapter(uuid, text, text) from public, anon;
revoke all on function public.delete_manuscript_chapter(uuid) from public, anon;
revoke all on function public.delete_archived_feedback(uuid, text) from public, anon;

grant execute on function public.create_manuscript_chapter(uuid, text, text, uuid[]) to authenticated;
grant execute on function public.update_manuscript_chapter(uuid, text, text) to authenticated;
grant execute on function public.delete_manuscript_chapter(uuid) to authenticated;
grant execute on function public.delete_archived_feedback(uuid, text) to authenticated;
