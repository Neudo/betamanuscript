-- A chapter must be removed through delete_manuscript_chapter so the chapter,
-- its blocks, and all related feedback are archived together.

drop policy if exists "Version owners can delete chapters" on public.manuscript_chapters;
