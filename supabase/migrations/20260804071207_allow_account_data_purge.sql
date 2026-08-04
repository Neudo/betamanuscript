-- Account deletion permanently removes a manuscript graph, including versions
-- that were previously shared with readers. The existing protection triggers
-- still apply to ordinary mutations, but this transaction-scoped setting lets
-- the server-only account purge proceed through cascading deletes.

create or replace function private.prevent_shared_version_genre_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_version_id uuid := coalesce(new.manuscript_version_id, old.manuscript_version_id);
begin
  if current_setting('app.allow_manuscript_chapter_mutation', true) = 'on' then
    return coalesce(new, old);
  end if;

  if exists (
    select 1
    from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = target_version_id
      and reading_round.status in ('open', 'closed')
  ) then
    raise exception 'Create a new manuscript version instead of changing a version that has been shared with readers.';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function private.prevent_shared_version_genre_changes() from public, anon, authenticated;

create or replace function public.delete_account_data(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(coalesce(p_email, '')));
begin
  perform set_config('app.allow_manuscript_chapter_mutation', 'on', true);

  delete from public.reader_assignments reader_assignment
  where reader_assignment.reader_profile_id = p_user_id
    or (
      normalized_email <> ''
      and lower(reader_assignment.reader_email) = normalized_email
    );

  delete from public.reading_invitations invitation
  where invitation.accepted_by_profile_id = p_user_id
    or (
      normalized_email <> ''
      and lower(invitation.recipient_email) = normalized_email
    );

  -- Both relations use ON DELETE RESTRICT and therefore have to be removed
  -- before the manuscript cascade reaches chapters and annotation tags.
  delete from public.annotations annotation
  using public.manuscript_chapters chapter,
        public.manuscript_versions manuscript_version,
        public.manuscripts manuscript
  where annotation.chapter_id = chapter.id
    and chapter.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = manuscript.id
    and manuscript.owner_id = p_user_id;

  delete from public.surveys survey
  using public.reading_rounds reading_round,
        public.manuscript_versions manuscript_version,
        public.manuscripts manuscript
  where survey.reading_round_id = reading_round.id
    and reading_round.manuscript_version_id = manuscript_version.id
    and manuscript_version.manuscript_id = manuscript.id
    and manuscript.owner_id = p_user_id;

  delete from public.manuscripts manuscript
  where manuscript.owner_id = p_user_id;
end;
$$;

revoke all on function public.delete_account_data(uuid, text) from public, anon, authenticated;
grant execute on function public.delete_account_data(uuid, text) to service_role;
