-- `active` was the former name for a reader who had already begun. Keeping
-- the data semantics explicit makes pending invitations harmless to capacity.
update public.reader_assignments
set
  status = 'started',
  started_at = coalesce(started_at, created_at)
where status = 'active';

alter table public.reader_assignments
  alter column status set default 'pending';

create unique index reader_assignments_invitation_unique_idx
  on public.reader_assignments (reading_invitation_id)
  where reading_invitation_id is not null;

create or replace function private.is_assignment_owner(p_reader_assignment_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.reader_assignments reader_assignment
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status in ('started', 'completed')
); $$;

create or replace function private.has_round_assignment(p_reading_round_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = p_reading_round_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status in ('started', 'completed')
); $$;

create or replace function private.can_read_manuscript_version(p_manuscript_version_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and (
  exists (
    select 1 from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id = p_manuscript_version_id
      and manuscript.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.reading_rounds reading_round
    join public.reader_assignments reader_assignment on reader_assignment.reading_round_id = reading_round.id
    where reading_round.manuscript_version_id = p_manuscript_version_id
      and reader_assignment.reader_profile_id = (select auth.uid())
      and reader_assignment.status in ('started', 'completed')
      and reading_round.status in ('open', 'closed')
  )
); $$;

create or replace function private.can_assignment_access_chapter(
  p_reader_assignment_id uuid,
  p_chapter_id uuid
)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1
  from public.reader_assignments reader_assignment
  join public.reading_rounds reading_round on reading_round.id = reader_assignment.reading_round_id
  join public.manuscript_chapters chapter on chapter.manuscript_version_id = reading_round.manuscript_version_id
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status = 'started'
    and reading_round.status = 'open'
    and chapter.id = p_chapter_id
); $$;

create or replace function private.can_create_survey_submission(
  p_reader_assignment_id uuid,
  p_survey_id uuid
)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1
  from public.reader_assignments reader_assignment
  join public.surveys survey on survey.reading_round_id = reader_assignment.reading_round_id
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status = 'started'
    and survey.id = p_survey_id
    and survey.status = 'active'
); $$;

create or replace function private.enforce_reading_round_plan_limit()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  current_plan public.account_plan;
  assigned_readers integer;
begin
  select profile.plan into current_plan
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  join public.profiles profile on profile.id = manuscript.owner_id
  where manuscript_version.id = new.manuscript_version_id
  for update of profile;

  if current_plan is null then
    raise exception 'The reading round must belong to a manuscript owner profile.';
  end if;

  if current_plan = 'free' and new.max_readers > 5 then
    raise exception 'The free plan is limited to five readers per reading round.';
  end if;

  if tg_op = 'UPDATE' then
    select count(*) into assigned_readers
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = new.id
      and reader_assignment.status in ('started', 'completed');

    if assigned_readers > new.max_readers then
      raise exception 'The reader limit cannot be lower than the current started reader count.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.enforce_reading_round_capacity()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  capacity integer;
  round_status public.reading_round_status;
  occupied_slots integer;
  should_check boolean := false;
begin
  if tg_op = 'INSERT' then
    should_check := new.status in ('started', 'completed');
  else
    should_check := new.status in ('started', 'completed')
      and (
        old.reading_round_id is distinct from new.reading_round_id
        or old.status not in ('started', 'completed')
      );
  end if;

  if should_check then
    -- Every contender locks the same round row before counting. This serializes
    -- simultaneous acceptances, so a sixth reader cannot slip through.
    select reading_round.max_readers, reading_round.status
    into capacity, round_status
    from public.reading_rounds reading_round
    where reading_round.id = new.reading_round_id
    for update;

    if round_status <> 'open' then
      raise exception 'Readers can only start an open reading round.';
    end if;

    select count(*) into occupied_slots
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = new.reading_round_id
      and reader_assignment.status in ('started', 'completed')
      and (tg_op = 'INSERT' or reader_assignment.id <> new.id);

    if occupied_slots >= capacity then
      raise exception 'This reading round has reached its reader limit.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.create_reading_invitation(
  p_reading_round_id uuid,
  p_recipient_email text,
  p_personal_note text,
  p_token_digest text
)
returns table (invitation_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
  target_round_status public.reading_round_status;
  created_invitation_id uuid;
  invitation_expires_at timestamptz := now() + interval '14 days';
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  normalized_email := lower(btrim(coalesce(p_recipient_email, '')));

  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+$' then
    raise exception 'A valid recipient email is required.' using errcode = '22023';
  end if;

  if char_length(normalized_email) > 320 then
    raise exception 'The recipient email is too long.' using errcode = '22023';
  end if;

  if p_personal_note is not null and char_length(p_personal_note) > 4000 then
    raise exception 'The personal note is too long.' using errcode = '22023';
  end if;

  if p_token_digest !~ '^[a-f0-9]{64}$' then
    raise exception 'The invitation token is invalid.' using errcode = '22023';
  end if;

  select reading_round.status
  into target_round_status
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = p_reading_round_id
    and manuscript.owner_id = auth.uid()
  for update of reading_round;

  if target_round_status is null then
    raise exception 'This reading round does not exist or is not yours.' using errcode = '42501';
  end if;

  if target_round_status not in ('draft', 'open') then
    raise exception 'Readers cannot be invited to a closed or archived round.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = p_reading_round_id
      and reader_assignment.reader_email = normalized_email
  ) then
    raise exception 'This email is already invited to this reading round.' using errcode = '23505';
  end if;

  insert into public.reading_invitations (
    reading_round_id,
    recipient_email,
    personal_note,
    token_digest,
    expires_at,
    status
  )
  values (
    p_reading_round_id,
    normalized_email,
    nullif(btrim(p_personal_note), ''),
    p_token_digest,
    invitation_expires_at,
    'pending'
  )
  returning id into created_invitation_id;

  insert into public.reader_assignments (
    reading_round_id,
    reading_invitation_id,
    reader_email,
    status
  )
  values (
    p_reading_round_id,
    created_invitation_id,
    normalized_email,
    'pending'
  );

  -- Sending the first invitation is the explicit publishing action: it opens
  -- the round and freezes the shared manuscript structure.
  if target_round_status = 'draft' then
    update public.reading_rounds
    set status = 'open', opened_at = coalesce(opened_at, now())
    where id = p_reading_round_id;
  end if;

  return query select created_invitation_id, invitation_expires_at;
end;
$$;

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
  token_digest text;
begin
  current_profile_id := auth.uid();
  current_email := lower(btrim(coalesce(auth.jwt() ->> 'email', '')));

  if current_profile_id is null or current_email = '' then
    raise exception 'Sign in with the invited email address before accepting.' using errcode = '42501';
  end if;

  token_digest := encode(extensions.digest(p_token, 'sha256'), 'hex');

  select * into invitation
  from public.reading_invitations
  where reading_invitations.token_digest = token_digest
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

  -- The capacity trigger locks the reading round and counts only started or
  -- completed readers. If this is the sixth simultaneous acceptance, this
  -- update raises and the whole transaction remains pending.
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

  -- A writer may also be invited to another author's manuscript. Preserve the
  -- writer workspace while granting access to the reader workspace.
  update public.profiles
  set role = case when role = 'writer' then 'both'::public.user_role else role end
  where id = current_profile_id;

  return query select invitation.reading_round_id, target_manuscript_id;
end;
$$;

create or replace function public.revoke_reading_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_round_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select invitation.reading_round_id into target_round_id
  from public.reading_invitations invitation
  join public.reading_rounds reading_round on reading_round.id = invitation.reading_round_id
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where invitation.id = p_invitation_id
    and manuscript.owner_id = auth.uid()
  for update of invitation;

  if target_round_id is null then
    raise exception 'This invitation does not exist or is not yours.' using errcode = '42501';
  end if;

  update public.reading_invitations
  set status = 'revoked', revoked_at = now()
  where id = p_invitation_id and status in ('pending', 'accepted');

  update public.reader_assignments
  set status = 'revoked'
  where reading_invitation_id = p_invitation_id
    and status in ('pending', 'started', 'completed');
end;
$$;

revoke all on function public.create_reading_invitation(uuid, text, text, text) from public, anon;
revoke all on function public.accept_reading_invitation(text) from public, anon;
revoke all on function public.revoke_reading_invitation(uuid) from public, anon;

grant execute on function public.create_reading_invitation(uuid, text, text, text) to authenticated;
grant execute on function public.accept_reading_invitation(text) to authenticated;
grant execute on function public.revoke_reading_invitation(uuid) to authenticated;
