-- Archived feedback is author-only. Readers cannot edit or delete a record
-- once the author has archived it after a chapter revision.

drop policy if exists "Chapter owners and readers can update annotations" on public.annotations;
create policy "Chapter owners and readers can update annotations"
on public.annotations
for update
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
)
with check (
  private.is_chapter_owner(chapter_id)
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
);

drop policy if exists "Chapter owners and readers can update general comments" on public.chapter_general_comments;
create policy "Chapter owners and readers can update general comments"
on public.chapter_general_comments
for update
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
)
with check (
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
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
);

drop policy if exists "Chapter owners and readers can delete general comments" on public.chapter_general_comments;
create policy "Chapter owners and readers can delete general comments"
on public.chapter_general_comments
for delete
to authenticated
using (
  (private.is_chapter_owner(chapter_id) and archived_at is not null)
  or (archived_at is null and private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
);
