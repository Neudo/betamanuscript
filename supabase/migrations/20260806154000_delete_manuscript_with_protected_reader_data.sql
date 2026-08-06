-- Reader responses are deliberately protected by RLS and immutable-survey
-- guards during normal editing. A confirmed manuscript deletion must remove
-- that full graph, so this narrowly scoped RPC verifies ownership first and
-- is executable only by authenticated users.

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

  -- This transaction is an explicit full purge, not an ordinary chapter edit.
  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  -- Annotations and surveys intentionally use restrictive foreign keys. Their
  -- roots must be removed before the manuscript cascade reaches shared blocks
  -- and chapters. Deleting submissions first keeps filled survey definitions
  -- immutable during ordinary use while allowing this confirmed full purge.
  delete from public.annotations annotation
  using public.manuscript_chapters chapter,
        public.manuscript_versions manuscript_version
  where annotation.chapter_id = chapter.id
    and chapter.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.survey_submissions submission
  using public.surveys survey,
        public.reading_rounds reading_round,
        public.manuscript_versions manuscript_version
  where submission.survey_id = survey.id
    and survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.surveys survey
  using public.reading_rounds reading_round,
        public.manuscript_versions manuscript_version
  where survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = p_manuscript_id;

  delete from public.pending_public_feedback pending_feedback
  using public.reading_round_access_links access_link,
        public.reading_rounds reading_round,
        public.manuscript_versions manuscript_version
  where pending_feedback.public_link_id = access_link.id
    and access_link.reading_round_id = reading_round.id
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
