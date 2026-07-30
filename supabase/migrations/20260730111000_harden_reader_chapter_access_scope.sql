-- Defense in depth: chapter access must also belong to the assignment's draft,
-- even if malformed data were ever inserted outside the author-owned RPC.

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
    where chapter_access.chapter_id = p_chapter_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
  );
$$;
