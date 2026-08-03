create table public.pending_public_feedback (
  id uuid primary key default gen_random_uuid(),
  token_digest text not null unique check (token_digest ~ '^[0-9a-f]{64}$'),
  public_link_id uuid not null references public.reading_round_access_links(id) on delete cascade,
  kind text not null check (kind in ('annotation', 'general')),
  chapter_id uuid not null references public.manuscript_chapters(id) on delete cascade,
  chapter_block_id uuid references public.chapter_blocks(id) on delete cascade,
  tag_id uuid references public.manuscript_annotation_tags(id) on delete set null,
  quote text,
  selection_start integer,
  selection_end integer,
  selection_end_chapter_block_id uuid references public.chapter_blocks(id) on delete set null,
  selection_end_offset integer,
  context_before text,
  context_after text,
  comment text,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  bound_profile_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  check (
    (
      kind = 'annotation'
      and chapter_block_id is not null
      and tag_id is not null
      and quote is not null
      and selection_start is not null
      and selection_end is not null
    )
    or (
      kind = 'general'
      and chapter_block_id is null
      and tag_id is null
      and quote is null
      and selection_start is null
      and selection_end is null
      and selection_end_chapter_block_id is null
      and selection_end_offset is null
      and context_before is null
      and context_after is null
    )
  )
);

create index pending_public_feedback_expires_at_idx
  on public.pending_public_feedback (expires_at);

create index pending_public_feedback_bound_profile_idx
  on public.pending_public_feedback (bound_profile_id)
  where bound_profile_id is not null;

alter table public.pending_public_feedback enable row level security;

revoke all on table public.pending_public_feedback from anon, authenticated;
grant all on table public.pending_public_feedback to service_role;

create or replace function public.create_pending_public_feedback(
  p_public_link_id uuid,
  p_token_digest text,
  p_fingerprint_hash text,
  p_kind text,
  p_chapter_id uuid,
  p_chapter_block_id uuid,
  p_tag_id uuid,
  p_quote text,
  p_selection_start integer,
  p_selection_end integer,
  p_selection_end_chapter_block_id uuid,
  p_selection_end_offset integer,
  p_context_before text,
  p_context_after text,
  p_comment text,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_version_id uuid;
  pending_feedback_id uuid;
begin
  if p_token_digest !~ '^[0-9a-f]{64}$'
    or p_fingerprint_hash !~ '^[0-9a-f]{64}$'
    or char_length(btrim(coalesce(p_display_name, ''))) not between 2 and 80
    or p_kind not in ('annotation', 'general') then
    raise exception 'Feedback content is invalid.' using errcode = '22023';
  end if;

  if not private.consume_reader_request_rate_limit(
    'pending-public-feedback:' || p_public_link_id::text,
    p_fingerprint_hash,
    12,
    interval '5 minutes'
  ) then
    raise exception 'Too many feedback attempts. Please try again in a few minutes.' using errcode = 'P0001';
  end if;

  select reading_round.manuscript_version_id
  into target_version_id
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

  if target_version_id is null then
    raise exception 'This public reading link is no longer available.' using errcode = '42501';
  end if;

  if p_kind = 'annotation' then
    if p_chapter_block_id is null or p_tag_id is null then
      raise exception 'Feedback content is invalid.' using errcode = '22023';
    end if;

    perform private.validate_public_annotation_input(
      target_version_id,
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
  elsif p_comment is null or char_length(btrim(p_comment)) not between 1 and 4000
    or not exists (
      select 1
      from public.manuscript_chapters chapter
      where chapter.id = p_chapter_id
        and chapter.manuscript_version_id = target_version_id
        and chapter.archived_at is null
    ) then
    raise exception 'This general annotation is invalid.' using errcode = '22023';
  end if;

  delete from public.pending_public_feedback
  where expires_at <= now();

  insert into public.pending_public_feedback (
    token_digest,
    public_link_id,
    kind,
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
    comment,
    display_name
  )
  values (
    p_token_digest,
    p_public_link_id,
    p_kind,
    p_chapter_id,
    case when p_kind = 'annotation' then p_chapter_block_id else null end,
    case when p_kind = 'annotation' then p_tag_id else null end,
    case when p_kind = 'annotation' then p_quote else null end,
    case when p_kind = 'annotation' then p_selection_start else null end,
    case when p_kind = 'annotation' then p_selection_end else null end,
    case when p_kind = 'annotation' then p_selection_end_chapter_block_id else null end,
    case when p_kind = 'annotation' then p_selection_end_offset else null end,
    case when p_kind = 'annotation' then p_context_before else null end,
    case when p_kind = 'annotation' then p_context_after else null end,
    case when p_kind = 'annotation' then nullif(btrim(p_comment), '') else btrim(p_comment) end,
    btrim(p_display_name)
  )
  returning id into pending_feedback_id;

  return pending_feedback_id;
end;
$$;

create or replace function public.bind_pending_public_feedback(
  p_token_digest text,
  p_profile_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_token_digest !~ '^[0-9a-f]{64}$' or p_profile_id is null then
    raise exception 'The saved feedback is invalid.' using errcode = '22023';
  end if;

  update public.pending_public_feedback
  set bound_profile_id = p_profile_id
  where token_digest = p_token_digest
    and expires_at > now()
    and (bound_profile_id is null or bound_profile_id = p_profile_id);

  if not found then
    raise exception 'The saved feedback is no longer available.' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.finalize_pending_public_feedback(
  p_token_digest text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  pending_feedback public.pending_public_feedback%rowtype;
  claimed_assignment record;
  feedback_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Create an account or sign in before saving feedback.' using errcode = '42501';
  end if;

  if p_token_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'The saved feedback is invalid.' using errcode = '22023';
  end if;

  select * into pending_feedback
  from public.pending_public_feedback
  where token_digest = p_token_digest
    and expires_at > now()
  for update;

  if not found then
    raise exception 'This saved feedback is no longer available.' using errcode = '22023';
  end if;

  if pending_feedback.bound_profile_id is not null
    and pending_feedback.bound_profile_id <> current_profile_id then
    raise exception 'This saved feedback belongs to another account.' using errcode = '42501';
  end if;

  if pending_feedback.bound_profile_id is null then
    update public.pending_public_feedback
    set bound_profile_id = current_profile_id
    where id = pending_feedback.id;
  end if;

  select * into claimed_assignment
  from private.claim_public_reader_assignment(pending_feedback.public_link_id);

  if pending_feedback.kind = 'annotation' then
    perform private.validate_public_annotation_input(
      claimed_assignment.manuscript_version_id,
      pending_feedback.chapter_id,
      pending_feedback.chapter_block_id,
      pending_feedback.selection_end_chapter_block_id,
      pending_feedback.selection_start,
      pending_feedback.selection_end,
      pending_feedback.selection_end_offset,
      pending_feedback.quote,
      pending_feedback.comment,
      pending_feedback.tag_id
    );

    if pending_feedback.context_before is not null and char_length(pending_feedback.context_before) > 1000
      or pending_feedback.context_after is not null and char_length(pending_feedback.context_after) > 1000 then
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
      pending_feedback.chapter_id,
      pending_feedback.chapter_block_id,
      pending_feedback.tag_id,
      pending_feedback.quote,
      pending_feedback.selection_start,
      pending_feedback.selection_end,
      pending_feedback.selection_end_chapter_block_id,
      pending_feedback.selection_end_offset,
      pending_feedback.context_before,
      pending_feedback.context_after,
      pending_feedback.comment
    )
    returning id into feedback_id;
  else
    if pending_feedback.comment is null
      or char_length(btrim(pending_feedback.comment)) not between 1 and 4000
      or not exists (
        select 1
        from public.manuscript_chapters chapter
        where chapter.id = pending_feedback.chapter_id
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
      pending_feedback.chapter_id,
      pending_feedback.comment
    )
    on conflict (reader_assignment_id, chapter_id) do update
    set comment = excluded.comment, updated_at = now()
    returning id into feedback_id;
  end if;

  delete from public.pending_public_feedback
  where id = pending_feedback.id;

  return feedback_id;
end;
$$;

revoke all on function public.create_pending_public_feedback(uuid, text, text, text, uuid, uuid, uuid, text, integer, integer, uuid, integer, text, text, text, text) from public, anon, authenticated;
revoke all on function public.bind_pending_public_feedback(text, uuid) from public, anon, authenticated;
revoke all on function public.finalize_pending_public_feedback(text) from public, anon;

grant execute on function public.create_pending_public_feedback(uuid, text, text, text, uuid, uuid, uuid, text, integer, integer, uuid, integer, text, text, text, text) to service_role;
grant execute on function public.bind_pending_public_feedback(text, uuid) to service_role;
grant execute on function public.finalize_pending_public_feedback(text) to authenticated, service_role;
