-- Removing an entire manuscript is distinct from editing one shared chapter.
-- The owner may permanently delete the whole graph, including reader data.

create or replace function public.delete_manuscript(p_manuscript_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  deleted_manuscript_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to delete a manuscript.' using errcode = '42501';
  end if;

  perform 1
  from public.manuscripts manuscript
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = current_profile_id
  for update;

  if not found then
    raise exception 'This manuscript could not be found.' using errcode = 'P0002';
  end if;

  -- The chapter guards protect shared drafts from ordinary edits. This is a
  -- transaction-scoped exception for the explicit, confirmed full deletion.
  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  -- These relationships deliberately use ON DELETE RESTRICT. Remove them
  -- first; their own dependent rows are removed by their cascade constraints.
  delete from public.annotations annotation
  using public.manuscript_chapters chapter,
        public.manuscript_versions manuscript_version
  where annotation.chapter_id = chapter.id
    and chapter.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.surveys survey
  using public.reading_rounds reading_round,
        public.manuscript_versions manuscript_version
  where survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.manuscripts manuscript
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = current_profile_id
  returning manuscript.id into deleted_manuscript_id;

  if deleted_manuscript_id is null then
    raise exception 'This manuscript could not be deleted.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_manuscript(uuid) from public, anon;
grant execute on function public.delete_manuscript(uuid) to authenticated;
