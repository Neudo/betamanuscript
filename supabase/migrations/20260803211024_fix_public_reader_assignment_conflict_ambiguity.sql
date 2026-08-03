-- Output-column names of a `RETURNS TABLE` function are PL/pgSQL variables.
-- Referencing the reader_draft_access unique key by column therefore conflicts
-- with the `reader_assignment_id` output parameter at execution time.
create or replace function private.claim_public_reader_assignment(p_public_link_id uuid)
returns table (
  reader_assignment_id uuid,
  reading_round_id uuid,
  manuscript_version_id uuid,
  manuscript_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  current_email text := lower(btrim(coalesce(auth.jwt() ->> 'email', '')));
  current_display_name text;
  target_round_id uuid;
  target_version_id uuid;
  target_manuscript_id uuid;
  target_author_profile_id uuid;
  target_assignment public.reader_assignments%rowtype;
begin
  if current_profile_id is null or current_email = '' then
    raise exception 'Create an account or sign in before saving feedback.' using errcode = '42501';
  end if;

  if not private.consume_reader_request_rate_limit(
    'public-feedback:' || p_public_link_id::text,
    current_profile_id::text,
    12,
    interval '5 minutes'
  ) then
    raise exception 'Too many feedback attempts. Please try again in a few minutes.' using errcode = 'P0001';
  end if;

  select reading_round.id, reading_round.manuscript_version_id, manuscript.id, manuscript.owner_id
  into target_round_id, target_version_id, target_manuscript_id, target_author_profile_id
  from public.reading_round_access_links access_link
  join public.reading_rounds reading_round
    on reading_round.id = access_link.reading_round_id
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where access_link.id = p_public_link_id
    and access_link.revoked_at is null
    and (access_link.expires_at is null or access_link.expires_at > now())
    and reading_round.status = 'open'
    and reading_round.access_mode = 'open_signup'
    and manuscript.archived_at is null
    and manuscript_version.archived_at is null
  for update of access_link, reading_round;

  if target_round_id is null then
    raise exception 'This public reading link is no longer available.' using errcode = '42501';
  end if;

  if target_author_profile_id = current_profile_id then
    raise exception 'Authors cannot leave reader feedback on their own manuscript.' using errcode = '22023';
  end if;

  select display_name
  into current_display_name
  from public.profiles
  where id = current_profile_id;

  if current_display_name is null then
    raise exception 'Your BetaManuscript profile is unavailable.' using errcode = '42501';
  end if;

  select *
  into target_assignment
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = target_round_id
    and reader_assignment.reader_profile_id = current_profile_id
  for update;

  if not found then
    select *
    into target_assignment
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = target_round_id
      and reader_assignment.reader_email = current_email
    for update;
  end if;

  if found then
    if target_assignment.reader_profile_id is not null
      and target_assignment.reader_profile_id <> current_profile_id then
      raise exception 'This reader place belongs to another account.' using errcode = '42501';
    end if;

    if target_assignment.status = 'revoked' then
      raise exception 'Your participation in this reading round was removed by the author.' using errcode = '42501';
    end if;

    if target_assignment.status in ('pending', 'active') then
      update public.reading_invitations
      set
        status = 'accepted',
        accepted_at = now(),
        accepted_by_profile_id = current_profile_id,
        updated_at = now()
      where id = target_assignment.reading_invitation_id
        and status = 'pending';

      update public.reader_assignments
      set
        reader_profile_id = current_profile_id,
        reader_display_name = current_display_name,
        reading_invitation_id = null,
        participation_origin = 'public_link',
        status = 'started',
        joined_at = coalesce(joined_at, now()),
        started_at = coalesce(started_at, now()),
        last_active_at = now(),
        updated_at = now()
      where id = target_assignment.id
      returning * into target_assignment;
    else
      update public.reader_assignments
      set
        reader_profile_id = current_profile_id,
        reader_display_name = current_display_name,
        joined_at = coalesce(joined_at, now()),
        last_active_at = now(),
        updated_at = now()
      where id = target_assignment.id
      returning * into target_assignment;
    end if;
  else
    insert into public.reader_assignments (
      reading_round_id,
      reader_profile_id,
      reader_email,
      reader_display_name,
      participation_origin,
      status,
      joined_at,
      started_at,
      last_active_at
    )
    values (
      target_round_id,
      current_profile_id,
      current_email,
      current_display_name,
      'public_link',
      'started',
      now(),
      now(),
      now()
    )
    returning * into target_assignment;
  end if;

  insert into public.reader_draft_access (reader_assignment_id)
  values (target_assignment.id)
  on conflict on constraint reader_draft_access_reader_assignment_id_key do nothing;

  update public.profiles
  set role = case when role = 'writer' then 'both'::public.user_role else role end
  where id = current_profile_id;

  return query select target_assignment.id, target_round_id, target_version_id, target_manuscript_id;
end;
$$;
