-- A public link is deliberately a read-only capability. Becoming a reader still
-- requires an authenticated profile and an explicit, durable assignment.

alter table public.reader_assignments
  add column if not exists participation_origin text not null default 'email_invitation'
    check (participation_origin in ('email_invitation', 'public_link')),
  add column if not exists joined_at timestamptz,
  add column if not exists first_feedback_at timestamptz;

update public.reader_assignments
set joined_at = coalesce(started_at, created_at)
where joined_at is null
  and status in ('active', 'started', 'completed');

comment on column public.reader_assignments.participation_origin is
  'How the reader became a counted participant. A public view alone never creates this row.';
comment on column public.reader_assignments.joined_at is
  'When a counted reader joined the reading round. started_at remains reading-progress metadata.';
comment on column public.reader_assignments.first_feedback_at is
  'Timestamp of the reader first persisted annotation or general annotation.';

create type public.reader_place_request_status as enum (
  'pending',
  'accepted',
  'rejected',
  'cancelled'
);

create type public.reader_place_request_email_status as enum (
  'pending',
  'processing',
  'sent'
);

create table public.reader_place_requests (
  id uuid primary key default gen_random_uuid(),
  reading_round_id uuid not null references public.reading_rounds(id) on delete cascade,
  requester_profile_id uuid not null references public.profiles(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.reader_place_request_status not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'pending' and responded_at is null and cancelled_at is null)
    or (status in ('accepted', 'rejected') and responded_at is not null and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null)
  )
);

create unique index reader_place_requests_one_pending_request_idx
  on public.reader_place_requests (reading_round_id, requester_profile_id)
  where status = 'pending';

create index reader_place_requests_author_pending_idx
  on public.reader_place_requests (author_profile_id, reading_round_id, requested_at)
  where status = 'pending';

create table public.reader_place_request_notification_state (
  reading_round_id uuid primary key references public.reading_rounds(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  last_request_at timestamptz not null default now(),
  last_email_sent_at timestamptz,
  last_notified_request_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.reader_place_request_email_outbox (
  id uuid primary key default gen_random_uuid(),
  reading_round_id uuid not null references public.reading_rounds(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.reader_place_request_email_status not null default 'pending',
  not_before timestamptz not null default now(),
  processing_started_at timestamptz,
  included_through timestamptz,
  pending_request_count integer,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'pending' and sent_at is null)
    or (status = 'processing' and sent_at is null and processing_started_at is not null)
    or (status = 'sent' and sent_at is not null)
  )
);

create unique index reader_place_request_email_outbox_active_round_idx
  on public.reader_place_request_email_outbox (reading_round_id)
  where status in ('pending', 'processing');

create index reader_place_request_email_outbox_due_idx
  on public.reader_place_request_email_outbox (not_before, created_at)
  where status = 'pending';

create table private.reader_request_rate_limits (
  bucket text not null check (char_length(bucket) between 1 and 160),
  subject_hash text not null check (char_length(subject_hash) between 1 and 256),
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (bucket, subject_hash)
);

alter table public.reader_place_requests enable row level security;
alter table public.reader_place_request_notification_state enable row level security;
alter table public.reader_place_request_email_outbox enable row level security;

revoke all on table public.reader_place_requests from anon;
grant select on table public.reader_place_requests to authenticated;
grant all on table public.reader_place_requests to service_role;
grant all on table public.reader_place_request_notification_state to service_role;
grant all on table public.reader_place_request_email_outbox to service_role;
revoke all on table public.reader_place_request_notification_state from anon, authenticated;
revoke all on table public.reader_place_request_email_outbox from anon, authenticated;

create policy "Authors and requesters can read place requests"
on public.reader_place_requests
for select
to authenticated
using (
  author_profile_id = (select auth.uid())
  or requester_profile_id = (select auth.uid())
);

create or replace function private.consume_reader_request_rate_limit(
  p_bucket text,
  p_subject_hash text,
  p_limit integer,
  p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_allowed boolean;
begin
  if p_bucket is null or char_length(p_bucket) not between 1 and 160
    or p_subject_hash is null or char_length(p_subject_hash) not between 1 and 256
    or p_limit < 1 or p_window <= interval '0 seconds' then
    raise exception 'Invalid rate limit configuration.' using errcode = '22023';
  end if;

  insert into private.reader_request_rate_limits as limit_row (
    bucket,
    subject_hash,
    window_started_at,
    attempt_count,
    updated_at
  )
  values (p_bucket, p_subject_hash, now(), 1, now())
  on conflict (bucket, subject_hash) do update
  set
    window_started_at = case
      when limit_row.window_started_at <= now() - p_window then now()
      else limit_row.window_started_at
    end,
    attempt_count = case
      when limit_row.window_started_at <= now() - p_window then 1
      else limit_row.attempt_count + 1
    end,
    updated_at = now()
  returning attempt_count <= p_limit into is_allowed;

  return is_allowed;
end;
$$;

create or replace function public.consume_public_reading_rate_limit(
  p_public_link_id uuid,
  p_fingerprint_hash text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_fingerprint_hash is null or p_fingerprint_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid public-reading rate-limit fingerprint.' using errcode = '22023';
  end if;

  return private.consume_reader_request_rate_limit(
    'public-reading:' || p_public_link_id::text,
    p_fingerprint_hash,
    120,
    interval '5 minutes'
  );
end;
$$;

-- Paid accounts have unlimited contributors. Free accounts retain the existing
-- serialized capacity check, so concurrent sixth claims cannot pass.
create or replace function private.enforce_reading_round_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  capacity integer;
  round_status public.reading_round_status;
  owner_plan public.account_plan;
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
    select reading_round.max_readers, reading_round.status, profile.plan
    into capacity, round_status, owner_plan
    from public.reading_rounds reading_round
    join public.manuscript_versions manuscript_version
      on manuscript_version.id = reading_round.manuscript_version_id
    join public.manuscripts manuscript
      on manuscript.id = manuscript_version.manuscript_id
    join public.profiles profile
      on profile.id = manuscript.owner_id
    where reading_round.id = new.reading_round_id
    for update of reading_round, profile;

    if round_status <> 'open' then
      raise exception 'Readers can only start an open reading round.' using errcode = '22023';
    end if;

    if owner_plan = 'free' then
      select count(*) into occupied_slots
      from public.reader_assignments reader_assignment
      where reader_assignment.reading_round_id = new.reading_round_id
        and reader_assignment.status in ('started', 'completed')
        and (tg_op = 'INSERT' or reader_assignment.id <> new.id);

      if occupied_slots >= capacity then
        raise exception 'This beta-reading round has reached its reader limit.' using errcode = 'P0001';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enable_public_reading_link(p_reading_round_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  public_link_id uuid;
  target_round_status public.reading_round_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select reading_round.status
  into target_round_status
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = p_reading_round_id
    and manuscript.owner_id = auth.uid()
  for update of reading_round;

  if target_round_status is null then
    raise exception 'This reading round does not exist or is not yours.' using errcode = '42501';
  end if;

  if target_round_status not in ('draft', 'open') then
    raise exception 'A public link can only be enabled for a draft or open reading round.' using errcode = '22023';
  end if;

  update public.reading_round_access_links
  set revoked_at = now(), updated_at = now()
  where reading_round_id = p_reading_round_id
    and revoked_at is null;

  insert into public.reading_round_access_links (
    reading_round_id,
    token_digest
  )
  values (
    p_reading_round_id,
    encode(extensions.digest(gen_random_uuid()::text || clock_timestamp()::text, 'sha256'), 'hex')
  )
  returning id into public_link_id;

  update public.reading_rounds
  set
    access_mode = 'open_signup',
    status = case when target_round_status = 'draft' then 'open' else status end,
    opened_at = case when target_round_status = 'draft' then coalesce(opened_at, now()) else opened_at end,
    updated_at = now()
  where id = p_reading_round_id;

  return public_link_id;
end;
$$;

create or replace function public.disable_public_reading_link(p_reading_round_id uuid)
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

  select reading_round.id
  into target_round_id
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = p_reading_round_id
    and manuscript.owner_id = auth.uid()
  for update of reading_round;

  if target_round_id is null then
    raise exception 'This reading round does not exist or is not yours.' using errcode = '42501';
  end if;

  update public.reading_round_access_links
  set revoked_at = now(), updated_at = now()
  where reading_round_id = p_reading_round_id
    and revoked_at is null;

  update public.reading_rounds
  set access_mode = 'invite_only', updated_at = now()
  where id = p_reading_round_id;
end;
$$;

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
      -- A pending email invitation for the same account is fulfilled by this
      -- public contribution, but the participation source stays explicit.
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
  on conflict (reader_assignment_id) do nothing;

  update public.profiles
  set role = case when role = 'writer' then 'both'::public.user_role else role end
  where id = current_profile_id;

  return query select target_assignment.id, target_round_id, target_version_id, target_manuscript_id;
end;
$$;

create or replace function private.validate_public_annotation_input(
  p_manuscript_version_id uuid,
  p_chapter_id uuid,
  p_chapter_block_id uuid,
  p_selection_end_chapter_block_id uuid,
  p_selection_start integer,
  p_selection_end integer,
  p_selection_end_offset integer,
  p_quote text,
  p_comment text,
  p_tag_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  start_block_content text;
  end_block_content text;
  start_position integer;
  end_position integer;
begin
  if p_quote is null or char_length(p_quote) not between 1 and 10000
    or p_comment is not null and char_length(p_comment) > 4000 then
    raise exception 'Feedback content is invalid.' using errcode = '22023';
  end if;

  select chapter_block.content, chapter_block.position
  into start_block_content, start_position
  from public.chapter_blocks chapter_block
  join public.manuscript_chapters chapter on chapter.id = chapter_block.chapter_id
  where chapter_block.id = p_chapter_block_id
    and chapter_block.chapter_id = p_chapter_id
    and chapter.manuscript_version_id = p_manuscript_version_id
    and chapter.archived_at is null
    and chapter_block.archived_at is null;

  if start_block_content is null then
    raise exception 'The selected passage is no longer available.' using errcode = '22023';
  end if;

  select chapter_block.content, chapter_block.position
  into end_block_content, end_position
  from public.chapter_blocks chapter_block
  where chapter_block.id = coalesce(p_selection_end_chapter_block_id, p_chapter_block_id)
    and chapter_block.chapter_id = p_chapter_id
    and chapter_block.archived_at is null;

  if end_block_content is null
    or p_selection_start < 0
    or p_selection_start > char_length(start_block_content)
    or coalesce(p_selection_end_offset, p_selection_end) < 0
    or coalesce(p_selection_end_offset, p_selection_end) > char_length(end_block_content) then
    raise exception 'The selected passage is invalid.' using errcode = '22023';
  end if;

  if p_selection_end_chapter_block_id is null then
    if p_selection_end <= p_selection_start then
      raise exception 'Select at least one character before saving feedback.' using errcode = '22023';
    end if;
  elsif p_selection_end_offset is null
    or end_position <= start_position
    or p_selection_start >= char_length(start_block_content)
    or p_selection_end_offset <= 0 then
    raise exception 'The selected passage is invalid.' using errcode = '22023';
  end if;

  if not private.is_active_manuscript_tag_for_chapter(p_tag_id, p_chapter_id) then
    raise exception 'Choose an active feedback tag for this manuscript.' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.create_public_reader_annotation(
  p_public_link_id uuid,
  p_chapter_id uuid,
  p_chapter_block_id uuid,
  p_tag_id uuid,
  p_quote text,
  p_selection_start integer,
  p_selection_end integer,
  p_context_before text,
  p_context_after text,
  p_comment text,
  p_selection_end_chapter_block_id uuid default null,
  p_selection_end_offset integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_assignment record;
  annotation_id uuid;
begin
  select * into claimed_assignment
  from private.claim_public_reader_assignment(p_public_link_id);

  perform private.validate_public_annotation_input(
    claimed_assignment.manuscript_version_id,
    p_chapter_id,
    p_chapter_block_id,
    p_selection_end_chapter_block_id,
    p_selection_start,
    p_selection_end,
    p_selection_end_offset,
    p_quote,
    p_comment,
    p_tag_id
  );

  if p_context_before is not null and char_length(p_context_before) > 1000
    or p_context_after is not null and char_length(p_context_after) > 1000 then
    raise exception 'Feedback context is too long.' using errcode = '22023';
  end if;

  insert into public.annotations (
    reader_assignment_id,
    chapter_id,
    chapter_block_id,
    tag_id,
    quote,
    selection_start,
    selection_end,
    selection_end_chapter_block_id,
    selection_end_offset,
    context_before,
    context_after,
    comment
  )
  values (
    claimed_assignment.reader_assignment_id,
    p_chapter_id,
    p_chapter_block_id,
    p_tag_id,
    p_quote,
    p_selection_start,
    p_selection_end,
    p_selection_end_chapter_block_id,
    p_selection_end_offset,
    p_context_before,
    p_context_after,
    nullif(btrim(p_comment), '')
  )
  returning id into annotation_id;

  return annotation_id;
end;
$$;

create or replace function public.create_public_reader_general_annotation(
  p_public_link_id uuid,
  p_chapter_id uuid,
  p_comment text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_assignment record;
  general_annotation_id uuid;
begin
  select * into claimed_assignment
  from private.claim_public_reader_assignment(p_public_link_id);

  if p_comment is null or char_length(btrim(p_comment)) not between 1 and 4000
    or not exists (
      select 1
      from public.manuscript_chapters chapter
      where chapter.id = p_chapter_id
        and chapter.manuscript_version_id = claimed_assignment.manuscript_version_id
        and chapter.archived_at is null
    ) then
    raise exception 'This general annotation is invalid.' using errcode = '22023';
  end if;

  insert into public.chapter_general_comments (
    reader_assignment_id,
    chapter_id,
    comment
  )
  values (
    claimed_assignment.reader_assignment_id,
    p_chapter_id,
    btrim(p_comment)
  )
  on conflict (reader_assignment_id, chapter_id) do update
  set comment = excluded.comment, updated_at = now()
  returning id into general_annotation_id;

  return general_annotation_id;
end;
$$;

create or replace function private.record_reader_first_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reader_assignments
  set
    first_feedback_at = coalesce(first_feedback_at, now()),
    updated_at = now()
  where id = new.reader_assignment_id;

  return new;
end;
$$;

drop trigger if exists annotations_record_reader_first_feedback on public.annotations;
create trigger annotations_record_reader_first_feedback
after insert on public.annotations
for each row execute procedure private.record_reader_first_feedback();

drop trigger if exists chapter_general_comments_record_reader_first_feedback on public.chapter_general_comments;
create trigger chapter_general_comments_record_reader_first_feedback
after insert on public.chapter_general_comments
for each row execute procedure private.record_reader_first_feedback();

create or replace function private.queue_reader_place_request_email(
  p_reading_round_id uuid,
  p_author_profile_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_state public.reader_place_request_notification_state%rowtype;
  scheduled_at timestamptz;
begin
  insert into public.reader_place_request_notification_state (
    reading_round_id,
    author_profile_id,
    last_request_at
  )
  values (p_reading_round_id, p_author_profile_id, now())
  on conflict (reading_round_id) do update
  set
    author_profile_id = excluded.author_profile_id,
    last_request_at = now(),
    updated_at = now();

  select * into notification_state
  from public.reader_place_request_notification_state
  where reading_round_id = p_reading_round_id
  for update;

  if exists (
    select 1
    from public.reader_place_request_email_outbox outbox
    where outbox.reading_round_id = p_reading_round_id
      and outbox.status in ('pending', 'processing')
  ) then
    return;
  end if;

  scheduled_at := greatest(
    now(),
    coalesce(notification_state.last_email_sent_at + interval '6 hours', now())
  );

  insert into public.reader_place_request_email_outbox (
    reading_round_id,
    author_profile_id,
    not_before
  )
  values (p_reading_round_id, p_author_profile_id, scheduled_at);
end;
$$;

create or replace function public.create_reader_place_request(p_public_link_id uuid)
returns table (request_id uuid, status public.reader_place_request_status)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  target_round_id uuid;
  target_author_profile_id uuid;
  target_plan public.account_plan;
  reader_limit integer;
  counted_readers integer;
  existing_request public.reader_place_requests%rowtype;
begin
  if current_profile_id is null then
    raise exception 'Create an account or sign in before requesting a place.' using errcode = '42501';
  end if;

  if not private.consume_reader_request_rate_limit(
    'reader-place-request:' || p_public_link_id::text,
    current_profile_id::text,
    4,
    interval '1 hour'
  ) then
    raise exception 'Too many place requests. Please try again later.' using errcode = 'P0001';
  end if;

  select reading_round.id, manuscript.owner_id, profile.plan, reading_round.max_readers
  into target_round_id, target_author_profile_id, target_plan, reader_limit
  from public.reading_round_access_links access_link
  join public.reading_rounds reading_round
    on reading_round.id = access_link.reading_round_id
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  join public.profiles profile on profile.id = manuscript.owner_id
  where access_link.id = p_public_link_id
    and access_link.revoked_at is null
    and (access_link.expires_at is null or access_link.expires_at > now())
    and reading_round.status = 'open'
    and reading_round.access_mode = 'open_signup'
  for update of access_link, reading_round, profile;

  if target_round_id is null then
    raise exception 'This public reading link is no longer available.' using errcode = '42501';
  end if;

  if target_author_profile_id = current_profile_id then
    raise exception 'Authors cannot request a reader place in their own round.' using errcode = '22023';
  end if;

  if target_plan = 'pro' then
    raise exception 'This reading round has room for another reader.' using errcode = '22023';
  end if;

  select count(*) into counted_readers
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = target_round_id
    and reader_assignment.status in ('started', 'completed');

  if counted_readers < reader_limit then
    raise exception 'This reading round still has an available reader place.' using errcode = '22023';
  end if;

  select * into existing_request
  from public.reader_place_requests place_request
  where place_request.reading_round_id = target_round_id
    and place_request.requester_profile_id = current_profile_id
    and place_request.status = 'pending'
  for update;

  if found then
    return query select existing_request.id, existing_request.status;
    return;
  end if;

  insert into public.reader_place_requests (
    reading_round_id,
    requester_profile_id,
    author_profile_id
  )
  values (
    target_round_id,
    current_profile_id,
    target_author_profile_id
  )
  returning id, reader_place_requests.status into request_id, status;

  perform private.queue_reader_place_request_email(target_round_id, target_author_profile_id);
end;
$$;

create or replace function public.cancel_reader_place_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  update public.reader_place_requests
  set
    status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
  where id = p_request_id
    and requester_profile_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'This pending place request is unavailable.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.list_author_reader_place_requests()
returns table (
  request_id uuid,
  reading_round_id uuid,
  requester_profile_id uuid,
  requester_email text,
  requester_display_name text,
  status public.reader_place_request_status,
  requested_at timestamptz,
  responded_at timestamptz,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  return query
  select
    place_request.id,
    place_request.reading_round_id,
    place_request.requester_profile_id,
    lower(btrim(auth_user.email)),
    profile.display_name,
    place_request.status,
    place_request.requested_at,
    place_request.responded_at,
    place_request.cancelled_at
  from public.reader_place_requests place_request
  join public.profiles profile on profile.id = place_request.requester_profile_id
  join auth.users auth_user on auth_user.id = place_request.requester_profile_id
  where place_request.author_profile_id = auth.uid()
  order by place_request.requested_at desc;
end;
$$;

create or replace function public.review_reader_place_request(
  p_request_id uuid,
  p_accept boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  place_request public.reader_place_requests%rowtype;
  requester_email text;
  requester_display_name text;
  target_assignment public.reader_assignments%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into place_request
  from public.reader_place_requests request_row
  where request_row.id = p_request_id
    and request_row.author_profile_id = auth.uid()
  for update;

  if not found then
    raise exception 'This place request does not exist or is not yours.' using errcode = '42501';
  end if;

  if place_request.status <> 'pending' then
    raise exception 'This place request has already been reviewed.' using errcode = '22023';
  end if;

  if not p_accept then
    update public.reader_place_requests
    set status = 'rejected', responded_at = now(), updated_at = now()
    where id = place_request.id;
    return null;
  end if;

  select lower(btrim(coalesce(email, '')))
  into requester_email
  from auth.users
  where id = place_request.requester_profile_id;

  select display_name
  into requester_display_name
  from public.profiles
  where id = place_request.requester_profile_id;

  if requester_email = '' or requester_display_name is null then
    raise exception 'The requester account is unavailable.' using errcode = '22023';
  end if;

  -- Lock the round before changing the assignment. The capacity trigger uses
  -- the same lock, so acceptance cannot race a first public feedback.
  perform 1
  from public.reading_rounds reading_round
  where reading_round.id = place_request.reading_round_id
  for update;

  select * into target_assignment
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = place_request.reading_round_id
    and reader_assignment.reader_profile_id = place_request.requester_profile_id
  for update;

  if not found then
    select * into target_assignment
    from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = place_request.reading_round_id
      and reader_assignment.reader_email = requester_email
    for update;
  end if;

  if found then
    if target_assignment.reader_profile_id is not null
      and target_assignment.reader_profile_id <> place_request.requester_profile_id then
      raise exception 'This reader place belongs to another account.' using errcode = '42501';
    end if;

    if target_assignment.status = 'pending' then
      update public.reading_invitations
      set
        status = 'accepted',
        accepted_at = now(),
        accepted_by_profile_id = place_request.requester_profile_id,
        updated_at = now()
      where id = target_assignment.reading_invitation_id
        and status = 'pending';
    end if;

    update public.reader_assignments
    set
      reader_email = requester_email,
      reader_display_name = requester_display_name,
      reader_profile_id = place_request.requester_profile_id,
      reading_invitation_id = case
        when target_assignment.status = 'pending' then null
        else reading_invitation_id
      end,
      participation_origin = 'public_link',
      status = 'started',
      joined_at = coalesce(joined_at, now()),
      started_at = coalesce(started_at, now()),
      last_active_at = now(),
      updated_at = now()
    where id = target_assignment.id
    returning * into target_assignment;
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
      place_request.reading_round_id,
      place_request.requester_profile_id,
      requester_email,
      requester_display_name,
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
  on conflict (reader_assignment_id) do nothing;

  update public.profiles
  set role = case when role = 'writer' then 'both'::public.user_role else role end
  where id = place_request.requester_profile_id;

  update public.reader_place_requests
  set status = 'accepted', responded_at = now(), updated_at = now()
  where id = place_request.id;

  return target_assignment.id;
end;
$$;

create or replace function public.claim_reader_place_request_email_notifications(
  p_limit integer default 20
)
returns table (
  outbox_id uuid,
  author_email text,
  manuscript_title text,
  pending_request_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  outbox_row public.reader_place_request_email_outbox%rowtype;
  included_at timestamptz;
  pending_count integer;
begin
  if p_limit < 1 or p_limit > 50 then
    raise exception 'The notification batch size is invalid.' using errcode = '22023';
  end if;

  for outbox_row in
    select *
    from public.reader_place_request_email_outbox outbox
    where (
      (outbox.status = 'pending' and outbox.not_before <= now())
      or (
        outbox.status = 'processing'
        and outbox.processing_started_at <= now() - interval '15 minutes'
      )
    )
    order by outbox.not_before, outbox.created_at
    for update skip locked
    limit p_limit
  loop
    included_at := now();
    select count(*) into pending_count
    from public.reader_place_requests place_request
    where place_request.reading_round_id = outbox_row.reading_round_id
      and place_request.status = 'pending';

    if pending_count = 0 then
      update public.reader_place_request_email_outbox
      set status = 'sent', sent_at = now(), updated_at = now()
      where id = outbox_row.id;
      continue;
    end if;

    update public.reader_place_request_email_outbox
    set
      status = 'processing',
      processing_started_at = now(),
      included_through = included_at,
      pending_request_count = pending_count,
      attempts = attempts + 1,
      last_error = null,
      updated_at = now()
    where id = outbox_row.id;

    return query
    select
      outbox_row.id,
      lower(btrim(auth_user.email)),
      manuscript_version.title,
      pending_count
    from auth.users auth_user
    join public.profiles author_profile on author_profile.id = auth_user.id
    join public.manuscripts manuscript on manuscript.owner_id = author_profile.id
    join public.manuscript_versions manuscript_version on manuscript_version.manuscript_id = manuscript.id
    join public.reading_rounds reading_round on reading_round.manuscript_version_id = manuscript_version.id
    where author_profile.id = outbox_row.author_profile_id
      and reading_round.id = outbox_row.reading_round_id;
  end loop;
end;
$$;

create or replace function public.mark_reader_place_request_email_sent(p_outbox_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  outbox_row public.reader_place_request_email_outbox%rowtype;
  state_row public.reader_place_request_notification_state%rowtype;
begin
  select * into outbox_row
  from public.reader_place_request_email_outbox outbox
  where outbox.id = p_outbox_id
  for update;

  if not found or outbox_row.status <> 'processing' then
    raise exception 'This notification email cannot be marked as sent.' using errcode = '22023';
  end if;

  update public.reader_place_request_email_outbox
  set status = 'sent', sent_at = now(), updated_at = now()
  where id = p_outbox_id;

  select * into state_row
  from public.reader_place_request_notification_state notification_state
  where notification_state.reading_round_id = outbox_row.reading_round_id
  for update;

  update public.reader_place_request_notification_state
  set
    last_email_sent_at = now(),
    last_notified_request_at = greatest(
      coalesce(last_notified_request_at, '-infinity'::timestamptz),
      coalesce(outbox_row.included_through, now())
    ),
    updated_at = now()
  where reading_round_id = outbox_row.reading_round_id;

  if state_row.last_request_at > coalesce(outbox_row.included_through, '-infinity'::timestamptz) then
    insert into public.reader_place_request_email_outbox (
      reading_round_id,
      author_profile_id,
      not_before
    )
    values (
      outbox_row.reading_round_id,
      outbox_row.author_profile_id,
      now() + interval '6 hours'
    )
    on conflict (reading_round_id) where status in ('pending', 'processing') do nothing;
  end if;
end;
$$;

create or replace function public.reschedule_reader_place_request_email(
  p_outbox_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reader_place_request_email_outbox
  set
    status = 'pending',
    processing_started_at = null,
    not_before = now() + interval '5 minutes',
    last_error = left(coalesce(p_error, 'Unknown email delivery error'), 1000),
    updated_at = now()
  where id = p_outbox_id
    and status = 'processing';

  if not found then
    raise exception 'This notification email cannot be rescheduled.' using errcode = '22023';
  end if;
end;
$$;

revoke all on function private.consume_reader_request_rate_limit(text, text, integer, interval) from public, anon, authenticated;
revoke all on function private.claim_public_reader_assignment(uuid) from public, anon, authenticated;
revoke all on function private.validate_public_annotation_input(uuid, uuid, uuid, uuid, integer, integer, integer, text, text, uuid) from public, anon, authenticated;
revoke all on function private.record_reader_first_feedback() from public, anon, authenticated;
revoke all on function private.queue_reader_place_request_email(uuid, uuid) from public, anon, authenticated;

revoke all on function public.enable_public_reading_link(uuid) from public, anon;
revoke all on function public.disable_public_reading_link(uuid) from public, anon;
revoke all on function public.consume_public_reading_rate_limit(uuid, text) from public, anon, authenticated;
revoke all on function public.create_public_reader_annotation(uuid, uuid, uuid, uuid, text, integer, integer, text, text, text, uuid, integer) from public, anon;
revoke all on function public.create_public_reader_general_annotation(uuid, uuid, text) from public, anon;
revoke all on function public.create_reader_place_request(uuid) from public, anon;
revoke all on function public.cancel_reader_place_request(uuid) from public, anon;
revoke all on function public.list_author_reader_place_requests() from public, anon;
revoke all on function public.review_reader_place_request(uuid, boolean) from public, anon;
revoke all on function public.claim_reader_place_request_email_notifications(integer) from public, anon, authenticated;
revoke all on function public.mark_reader_place_request_email_sent(uuid) from public, anon, authenticated;
revoke all on function public.reschedule_reader_place_request_email(uuid, text) from public, anon, authenticated;

grant execute on function public.enable_public_reading_link(uuid) to authenticated, service_role;
grant execute on function public.disable_public_reading_link(uuid) to authenticated, service_role;
grant execute on function public.consume_public_reading_rate_limit(uuid, text) to service_role;
grant execute on function public.create_public_reader_annotation(uuid, uuid, uuid, uuid, text, integer, integer, text, text, text, uuid, integer) to authenticated, service_role;
grant execute on function public.create_public_reader_general_annotation(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.create_reader_place_request(uuid) to authenticated, service_role;
grant execute on function public.cancel_reader_place_request(uuid) to authenticated, service_role;
grant execute on function public.list_author_reader_place_requests() to authenticated, service_role;
grant execute on function public.review_reader_place_request(uuid, boolean) to authenticated, service_role;
grant execute on function public.claim_reader_place_request_email_notifications(integer) to service_role;
grant execute on function public.mark_reader_place_request_email_sent(uuid) to service_role;
grant execute on function public.reschedule_reader_place_request_email(uuid, text) to service_role;
