-- Readers own the text of their feedback, but not its anchor in the manuscript
-- or the writer-facing workflow fields. This makes client-side edit/delete safe
-- while keeping the original cited passage immutable.
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
      or new.quote is distinct from old.quote
      or new.selection_start is distinct from old.selection_start
      or new.selection_end is distinct from old.selection_end
      or new.context_before is distinct from old.context_before
      or new.context_after is distinct from old.context_after
      or new.author_seen_at is distinct from old.author_seen_at
      or new.author_resolved_at is distinct from old.author_resolved_at
    )
  then
    raise exception 'Readers can only update an annotation tag or comment.';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_reader_annotation_anchor_changes()
from public, anon, authenticated;

create trigger annotations_prevent_reader_anchor_changes
before update on public.annotations
for each row execute procedure private.prevent_reader_annotation_anchor_changes();

drop policy if exists "Chapter owners can update annotations" on public.annotations;
create policy "Chapter owners and readers can update annotations"
on public.annotations for update to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.is_assignment_owner(reader_assignment_id)
)
with check (
  private.is_chapter_owner(chapter_id)
  or private.is_assignment_owner(reader_assignment_id)
);

drop policy if exists "Chapter owners can delete annotations" on public.annotations;
create policy "Chapter owners and readers can delete annotations"
on public.annotations for delete to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.is_assignment_owner(reader_assignment_id)
);

-- The author workspace groups annotations using the same block and exact range.
create index annotations_block_range_idx
on public.annotations (chapter_block_id, selection_start, selection_end);
