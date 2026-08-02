-- The chapter editor archives the previous blocks before inserting the revised
-- ones. PostgreSQL checks the SELECT policy during UPDATE as well, so authors
-- must retain visibility of their own historical blocks. Readers remain
-- restricted to active blocks only.

drop policy if exists "Owners and assigned readers can read chapter blocks" on public.chapter_blocks;

create policy "Owners and assigned readers can read chapter blocks"
on public.chapter_blocks
for select
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or (archived_at is null and private.can_read_chapter(chapter_id))
);
