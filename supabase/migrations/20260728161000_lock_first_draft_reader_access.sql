-- Readers always retain access to the first active draft of a manuscript.
-- This is enforced in the RPC as well as the author-facing UI.

create or replace function public.set_reader_draft_access(
  p_reader_profile_id uuid,
  p_manuscript_version_id uuid,
  p_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_manuscript_id uuid;
  first_manuscript_version_id uuid;
  target_round_id uuid;
  target_round_status public.reading_round_status;
  target_assignment_id uuid;
  target_assignment_status public.reader_assignment_status;
  source_reader_email text;
  source_reader_display_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select manuscript.id
  into target_manuscript_id
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_manuscript_version_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = auth.uid();

  if target_manuscript_id is null then
    raise exception 'This draft is unavailable or is not yours.' using errcode = '42501';
  end if;

  select reading_round.manuscript_version_id
  into first_manuscript_version_id
  from public.manuscript_versions manuscript_version
  join public.reading_rounds reading_round
    on reading_round.manuscript_version_id = manuscript_version.id
  where manuscript_version.manuscript_id = target_manuscript_id
    and manuscript_version.archived_at is null
    and reading_round.status <> 'archived'
  order by manuscript_version.version_number asc, reading_round.created_at desc
  limit 1;

  if not p_enabled and p_manuscript_version_id = first_manuscript_version_id then
    raise exception 'The first draft is always available to accepted readers.' using errcode = '22023';
  end if;

  select reader_assignment.reader_email, reader_assignment.reader_display_name
  into source_reader_email, source_reader_display_name
  from public.reader_assignments reader_assignment
  join public.reading_rounds reading_round
    on reading_round.id = reader_assignment.reading_round_id
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where manuscript_version.manuscript_id = target_manuscript_id
    and reader_assignment.reader_profile_id = p_reader_profile_id
    and reader_assignment.status in ('started', 'completed')
  order by reader_assignment.started_at desc nulls last, reader_assignment.created_at desc
  limit 1;

  if source_reader_email is null then
    raise exception 'The reader must accept their invitation before draft access can be managed.' using errcode = '22023';
  end if;

  if not p_enabled then
    delete from public.reader_draft_access reader_draft_access
    using public.reader_assignments reader_assignment, public.reading_rounds reading_round
    where reader_draft_access.reader_assignment_id = reader_assignment.id
      and reader_assignment.reading_round_id = reading_round.id
      and reader_assignment.reader_profile_id = p_reader_profile_id
      and reading_round.manuscript_version_id = p_manuscript_version_id;

    return;
  end if;

  select reading_round.id, reading_round.status
  into target_round_id, target_round_status
  from public.reading_rounds reading_round
  where reading_round.manuscript_version_id = p_manuscript_version_id
    and reading_round.status <> 'archived'
  order by reading_round.created_at desc
  limit 1;

  if target_round_id is null then
    raise exception 'This draft has no active reading round.' using errcode = '22023';
  end if;

  select reader_assignment.id, reader_assignment.status
  into target_assignment_id, target_assignment_status
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = target_round_id
    and reader_assignment.reader_profile_id = p_reader_profile_id
  limit 1;

  if target_assignment_id is null then
    insert into public.reader_assignments (
      reading_round_id,
      reader_profile_id,
      reader_email,
      reader_display_name,
      status,
      started_at,
      last_active_at
    )
    values (
      target_round_id,
      p_reader_profile_id,
      source_reader_email,
      source_reader_display_name,
      case when target_round_status = 'open' then 'started'::public.reader_assignment_status else 'pending'::public.reader_assignment_status end,
      case when target_round_status = 'open' then now() else null end,
      case when target_round_status = 'open' then now() else null end
    )
    returning id into target_assignment_id;
  elsif target_assignment_status = 'revoked'
    or (target_assignment_status = 'pending' and target_round_status = 'open') then
    update public.reader_assignments
    set
      reader_email = source_reader_email,
      reader_display_name = source_reader_display_name,
      status = case when target_round_status = 'open' then 'started'::public.reader_assignment_status else 'pending'::public.reader_assignment_status end,
      started_at = case when target_round_status = 'open' then coalesce(started_at, now()) else started_at end,
      last_active_at = case when target_round_status = 'open' then coalesce(last_active_at, now()) else last_active_at end
    where id = target_assignment_id;
  end if;

  insert into public.reader_draft_access (reader_assignment_id)
  values (target_assignment_id)
  on conflict (reader_assignment_id) do nothing;
end;
$$;

revoke all on function public.set_reader_draft_access(uuid, uuid, boolean) from public, anon;
grant execute on function public.set_reader_draft_access(uuid, uuid, boolean) to authenticated;

do $$
declare
  accepted_reader record;
begin
  for accepted_reader in
    select distinct on (manuscript_version.manuscript_id, reader_assignment.reader_profile_id)
      manuscript_version.manuscript_id,
      reader_assignment.reader_profile_id,
      reader_assignment.reader_email,
      reader_assignment.reader_display_name
    from public.reader_assignments reader_assignment
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_versions manuscript_version
      on manuscript_version.id = reading_round.manuscript_version_id
    where reader_assignment.reader_profile_id is not null
      and reader_assignment.status in ('started', 'completed')
      and manuscript_version.archived_at is null
    order by
      manuscript_version.manuscript_id,
      reader_assignment.reader_profile_id,
      reader_assignment.started_at desc nulls last,
      reader_assignment.created_at desc
  loop
    perform private.ensure_reader_first_draft_access(
      accepted_reader.manuscript_id,
      accepted_reader.reader_profile_id,
      accepted_reader.reader_email,
      accepted_reader.reader_display_name
    );
  end loop;
end;
$$;
