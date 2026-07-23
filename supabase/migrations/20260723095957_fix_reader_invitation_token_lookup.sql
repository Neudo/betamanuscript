create or replace function public.accept_reading_invitation(p_token text)
returns table (reading_round_id uuid, manuscript_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid;
  current_email text;
  current_display_name text;
  invitation public.reading_invitations%rowtype;
  assignment public.reader_assignments%rowtype;
  target_manuscript_id uuid;
  target_round_status public.reading_round_status;
  computed_token_digest text;
begin
  current_profile_id := auth.uid();
  current_email := lower(btrim(coalesce(auth.jwt() ->> 'email', '')));

  if current_profile_id is null or current_email = '' then
    raise exception 'Sign in with the invited email address before accepting.' using errcode = '42501';
  end if;

  computed_token_digest := encode(extensions.digest(p_token, 'sha256'), 'hex');

  select * into invitation
  from public.reading_invitations
  where reading_invitations.token_digest = computed_token_digest
  for update;

  if not found then
    raise exception 'This invitation link is invalid.' using errcode = '22023';
  end if;

  if invitation.status <> 'pending' then
    raise exception 'This invitation has already been used or is no longer available.' using errcode = '22023';
  end if;

  if invitation.expires_at is not null and invitation.expires_at <= now() then
    raise exception 'This invitation has expired.' using errcode = '22023';
  end if;

  if invitation.recipient_email <> current_email then
    raise exception 'Sign in with the email address that received this invitation.' using errcode = '42501';
  end if;

  select reader_assignment.* into assignment
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_invitation_id = invitation.id
  for update;

  if not found or assignment.status <> 'pending' then
    raise exception 'The pending reader assignment is unavailable.' using errcode = '22023';
  end if;

  select reading_round.status, manuscript.id
  into target_round_status, target_manuscript_id
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = invitation.reading_round_id;

  if target_round_status <> 'open' then
    raise exception 'This reading round is not open.' using errcode = '22023';
  end if;

  select display_name into current_display_name
  from public.profiles
  where id = current_profile_id;

  if current_display_name is null then
    raise exception 'Your account profile is unavailable.' using errcode = '42501';
  end if;

  update public.reader_assignments
  set
    reader_profile_id = current_profile_id,
    reader_display_name = current_display_name,
    status = 'started',
    started_at = now(),
    last_active_at = now()
  where id = assignment.id;

  update public.reading_invitations
  set
    status = 'accepted',
    accepted_at = now(),
    accepted_by_profile_id = current_profile_id
  where id = invitation.id;

  update public.profiles
  set role = case when role = 'writer' then 'both'::public.user_role else role end
  where id = current_profile_id;

  return query select invitation.reading_round_id, target_manuscript_id;
end;
$$;
