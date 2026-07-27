-- An annotation is still anchored at its first block, while these optional
-- fields preserve the final block and offset when a reader selects a passage
-- across multiple paragraphs. Existing single-block annotations stay valid.
alter table public.annotations
add column selection_end_chapter_block_id uuid
  references public.chapter_blocks(id) on delete restrict,
add column selection_end_offset integer;

alter table public.annotations
add constraint annotations_selection_end_anchor_check
check (
  (selection_end_chapter_block_id is null and selection_end_offset is null)
  or (
    selection_end_chapter_block_id is not null
    and selection_end_offset is not null
    and selection_end_offset >= 0
    and selection_end_chapter_block_id <> chapter_block_id
  )
);

-- Reader edits may change the tag or comment, never either annotation anchor.
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

revoke all on function private.prevent_reader_annotation_anchor_changes()
from public, anon, authenticated;

drop policy if exists "Readers can create annotations for their accessible chapters" on public.annotations;
create policy "Readers can create annotations for their accessible chapters"
on public.annotations for insert to authenticated
with check (
  private.is_assignment_owner(reader_assignment_id)
  and private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
  and private.is_active_manuscript_tag_for_chapter(tag_id, chapter_id)
  and exists (
    select 1
    from public.chapter_blocks start_block
    join public.chapter_blocks end_block
      on end_block.id = coalesce(
        annotations.selection_end_chapter_block_id,
        annotations.chapter_block_id
      )
    where start_block.id = annotations.chapter_block_id
      and start_block.chapter_id = annotations.chapter_id
      and end_block.chapter_id = annotations.chapter_id
      and annotations.selection_start between 0 and char_length(start_block.content)
      and coalesce(annotations.selection_end_offset, annotations.selection_end)
        between 0 and char_length(end_block.content)
      and (
        (
          annotations.selection_end_chapter_block_id is null
          and annotations.selection_end_offset is null
          and annotations.selection_end > annotations.selection_start
        )
        or (
          annotations.selection_end_chapter_block_id is not null
          and annotations.selection_end_offset is not null
          and end_block.position > start_block.position
          and annotations.selection_start < char_length(start_block.content)
          and annotations.selection_end = char_length(start_block.content)
          and annotations.selection_end_offset > 0
        )
      )
  )
);
