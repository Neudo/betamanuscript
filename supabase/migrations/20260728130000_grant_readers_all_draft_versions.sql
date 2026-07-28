-- Reader access belongs to the manuscript, not to one individual draft. Reading
-- rounds still own version-specific feedback, while an accepted reader can see
-- every draft of the same manuscript.

create or replace function private.is_assignment_owner(p_reader_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.id = p_reader_assignment_id
      and reader_assignment.reader_profile_id = (select auth.uid())
      and reader_assignment.status in ('pending', 'started', 'completed')
  );
$$;

create or replace function private.has_round_assignment(p_reading_round_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = p_reading_round_id
      and reader_assignment.reader_profile_id = (select auth.uid())
      and reader_assignment.status in ('pending', 'started', 'completed')
  );
$$;

create or replace function private.can_read_manuscript_version(p_manuscript_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    exists (
      select 1
      from public.manuscript_versions manuscript_version
      join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
      where manuscript_version.id = p_manuscript_version_id
        and manuscript.owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.manuscript_versions target_version
      join public.reading_rounds source_round
        on true
      join public.manuscript_versions source_version
        on source_version.id = source_round.manuscript_version_id
      join public.reader_assignments reader_assignment
        on reader_assignment.reading_round_id = source_round.id
      where target_version.id = p_manuscript_version_id
        and source_version.manuscript_id = target_version.manuscript_id
        and reader_assignment.reader_profile_id = (select auth.uid())
        and reader_assignment.status in ('started', 'completed')
    )
  );
$$;

create or replace function public.create_manuscript_reader_invitation(
  p_manuscript_id uuid,
  p_recipient_email text,
  p_personal_note text,
  p_token_digest text
)
returns table (invitation_id uuid, expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  normalized_email text;
  target_round_id uuid;
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

  -- The newest active draft is the canonical invitation round. Locking it also
  -- serializes duplicate invitations for the same manuscript and email.
  select reading_round.id, reading_round.status
  into target_round_id, target_round_status
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where manuscript.id = p_manuscript_id
    and manuscript.owner_id = auth.uid()
    and manuscript.archived_at is null
    and manuscript_version.archived_at is null
    and reading_round.status <> 'archived'
  order by manuscript_version.version_number desc, reading_round.created_at desc
  limit 1
  for update of reading_round;

  if target_round_id is null then
    raise exception 'This manuscript has no active reading round or is not yours.' using errcode = '42501';
  end if;

  if target_round_status not in ('draft', 'open') then
    raise exception 'Readers cannot be invited to a closed or archived manuscript.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.reader_assignments reader_assignment
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_versions manuscript_version
      on manuscript_version.id = reading_round.manuscript_version_id
    where manuscript_version.manuscript_id = p_manuscript_id
      and reader_assignment.reader_email = normalized_email
      and reader_assignment.status in ('pending', 'started', 'completed')
  ) then
    raise exception 'This email already has access to this manuscript.' using errcode = '23505';
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
    target_round_id,
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
    target_round_id,
    created_invitation_id,
    normalized_email,
    'pending'
  );

  -- A first invitation remains the explicit publishing action for the newest
  -- draft. Other drafts are readable after acceptance but only collect feedback
  -- once their own round is opened.
  if target_round_status = 'draft' then
    update public.reading_rounds
    set status = 'open', opened_at = coalesce(opened_at, now())
    where id = target_round_id;
  end if;

  return query select created_invitation_id, invitation_expires_at;
end;
$$;

revoke all on function public.create_manuscript_reader_invitation(uuid, text, text, text) from public, anon;
grant execute on function public.create_manuscript_reader_invitation(uuid, text, text, text) to authenticated;

-- Keep callers of the former round-level RPC on the manuscript-level access
-- model while the client migration rolls out.
create or replace function public.create_reading_invitation(
  p_reading_round_id uuid,
  p_recipient_email text,
  p_personal_note text,
  p_token_digest text
)
returns table (invitation_id uuid, expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_manuscript_id uuid;
begin
  select manuscript_version.manuscript_id
  into target_manuscript_id
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where reading_round.id = p_reading_round_id;

  return query
  select *
  from public.create_manuscript_reader_invitation(
    target_manuscript_id,
    p_recipient_email,
    p_personal_note,
    p_token_digest
  );
end;
$$;

revoke all on function public.create_reading_invitation(uuid, text, text, text) from public, anon;
grant execute on function public.create_reading_invitation(uuid, text, text, text) to authenticated;

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

  -- Each other draft gets an owned, read-only assignment. Its own round keeps
  -- control over when annotation and survey feedback may start.
  insert into public.reader_assignments (
    reading_round_id,
    reader_profile_id,
    reader_email,
    reader_display_name,
    status
  )
  select
    reading_round.id,
    current_profile_id,
    current_email,
    current_display_name,
    'pending'
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where manuscript_version.manuscript_id = target_manuscript_id
    and manuscript_version.archived_at is null
    and reading_round.status <> 'archived'
    and reading_round.id <> invitation.reading_round_id
  on conflict (reading_round_id, reader_email) do update
  set
    reader_profile_id = excluded.reader_profile_id,
    reader_display_name = excluded.reader_display_name,
    status = case
      when public.reader_assignments.status = 'revoked' then 'pending'
      else public.reader_assignments.status
    end;

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

create or replace function public.revoke_reading_invitation(p_invitation_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_manuscript_id uuid;
  target_recipient_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select manuscript_version.manuscript_id, invitation.recipient_email
  into target_manuscript_id, target_recipient_email
  from public.reading_invitations invitation
  join public.reading_rounds reading_round on reading_round.id = invitation.reading_round_id
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where invitation.id = p_invitation_id
    and manuscript.owner_id = auth.uid()
  for update of invitation;

  if target_manuscript_id is null then
    raise exception 'This invitation does not exist or is not yours.' using errcode = '42501';
  end if;

  update public.reading_invitations invitation
  set status = 'revoked', revoked_at = now()
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where invitation.reading_round_id = reading_round.id
    and manuscript_version.manuscript_id = target_manuscript_id
    and invitation.recipient_email = target_recipient_email
    and invitation.status in ('pending', 'accepted');

  update public.reader_assignments reader_assignment
  set status = 'revoked'
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where reader_assignment.reading_round_id = reading_round.id
    and manuscript_version.manuscript_id = target_manuscript_id
    and reader_assignment.reader_email = target_recipient_email
    and reader_assignment.status in ('pending', 'started', 'completed');
end;
$$;

create or replace function private.seed_manuscript_reader_assignments_for_round()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_manuscript_id uuid;
begin
  select manuscript_version.manuscript_id
  into target_manuscript_id
  from public.manuscript_versions manuscript_version
  where manuscript_version.id = new.manuscript_version_id;

  if target_manuscript_id is null then
    return new;
  end if;

  insert into public.reader_assignments (
    reading_round_id,
    reader_profile_id,
    reader_email,
    reader_display_name,
    status
  )
  select distinct on (lower(source_assignment.reader_email))
    new.id,
    source_assignment.reader_profile_id,
    source_assignment.reader_email,
    source_assignment.reader_display_name,
    'pending'
  from public.reader_assignments source_assignment
  join public.reading_rounds source_round
    on source_round.id = source_assignment.reading_round_id
  join public.manuscript_versions source_version
    on source_version.id = source_round.manuscript_version_id
  where source_version.manuscript_id = target_manuscript_id
    and source_round.id <> new.id
    and source_assignment.reader_profile_id is not null
    and source_assignment.status in ('started', 'completed')
  order by
    lower(source_assignment.reader_email),
    case source_assignment.status when 'started' then 2 when 'completed' then 1 else 0 end desc,
    source_assignment.started_at desc nulls last
  on conflict (reading_round_id, reader_email) do nothing;

  return new;
end;
$$;

drop trigger if exists reading_rounds_seed_manuscript_reader_assignments on public.reading_rounds;
create trigger reading_rounds_seed_manuscript_reader_assignments
after insert on public.reading_rounds
for each row execute procedure private.seed_manuscript_reader_assignments_for_round();

-- Existing accepted readers gain a read-only assignment on every existing
-- draft, so the new manuscript-level access takes effect immediately.
with accepted_readers as (
  select distinct on (manuscript_version.manuscript_id, lower(reader_assignment.reader_email))
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
  order by
    manuscript_version.manuscript_id,
    lower(reader_assignment.reader_email),
    case reader_assignment.status when 'started' then 2 when 'completed' then 1 else 0 end desc,
    reader_assignment.started_at desc nulls last
)
insert into public.reader_assignments (
  reading_round_id,
  reader_profile_id,
  reader_email,
  reader_display_name,
  status
)
select
  target_round.id,
  accepted_reader.reader_profile_id,
  accepted_reader.reader_email,
  accepted_reader.reader_display_name,
  'pending'
from accepted_readers accepted_reader
join public.manuscript_versions target_version
  on target_version.manuscript_id = accepted_reader.manuscript_id
join public.reading_rounds target_round
  on target_round.manuscript_version_id = target_version.id
where target_version.archived_at is null
  and target_round.status <> 'archived'
on conflict (reading_round_id, reader_email) do nothing;
