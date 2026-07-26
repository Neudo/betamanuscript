-- Keeps the manuscript's root title and active version metadata in sync.
-- SECURITY INVOKER preserves the caller's existing RLS permissions.

create or replace function public.update_manuscript_settings(
  p_manuscript_id uuid,
  p_title text,
  p_logline text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_title text := nullif(btrim(p_title), '');
  normalized_logline text := nullif(btrim(p_logline), '');
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to update a manuscript.' using errcode = '42501';
  end if;

  if normalized_title is null or char_length(normalized_title) > 300 then
    raise exception 'The title must contain between 1 and 300 characters.' using errcode = '22023';
  end if;

  if normalized_logline is not null and char_length(normalized_logline) > 2000 then
    raise exception 'The logline cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  update public.manuscripts manuscript
  set internal_title = normalized_title
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = current_profile_id
    and manuscript.archived_at is null;

  if not found then
    raise exception 'This manuscript could not be found.' using errcode = 'P0002';
  end if;

  update public.manuscript_versions manuscript_version
  set
    title = normalized_title,
    logline = normalized_logline
  where manuscript_version.id = (
    select active_version.id
    from public.manuscript_versions active_version
    where active_version.manuscript_id = p_manuscript_id
      and active_version.archived_at is null
    order by active_version.version_number desc
    limit 1
  );

  if not found then
    raise exception 'This manuscript has no active version to update.' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.update_manuscript_settings(uuid, text, text) from public, anon;
grant execute on function public.update_manuscript_settings(uuid, text, text) to authenticated;
