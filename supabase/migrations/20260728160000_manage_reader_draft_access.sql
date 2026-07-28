-- A reader's access is explicit per draft. Being invited to one reading round
-- no longer exposes every version of the manuscript.

create table public.reader_draft_access (
  id uuid primary key default gen_random_uuid(),
  reader_assignment_id uuid not null unique
    references public.reader_assignments(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.reader_draft_access enable row level security;

revoke all on table public.reader_draft_access from public, anon;
grant select on table public.reader_draft_access to authenticated;

create policy "Authors can view reader draft access"
on public.reader_draft_access
for select
to authenticated
using (
  exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.id = reader_draft_access.reader_assignment_id
      and private.is_round_owner(reader_assignment.reading_round_id)
  )
);

create policy "Readers can view their draft access"
on public.reader_draft_access
for select
to authenticated
using (
  exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.id = reader_draft_access.reader_assignment_id
      and reader_assignment.reader_profile_id = (select auth.uid())
      and reader_assignment.status in ('pending', 'started', 'completed')
  )
);

create or replace function private.has_assignment_draft_access(p_reader_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reader_draft_access reader_draft_access
    where reader_draft_access.reader_assignment_id = p_reader_assignment_id
  );
$$;

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
      and private.has_assignment_draft_access(reader_assignment.id)
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
    from public.reader_draft_access reader_draft_access
    join public.reader_assignments reader_assignment
      on reader_assignment.id = reader_draft_access.reader_assignment_id
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
      from public.reader_draft_access reader_draft_access
      join public.reader_assignments reader_assignment
        on reader_assignment.id = reader_draft_access.reader_assignment_id
      join public.reading_rounds reading_round
        on reading_round.id = reader_assignment.reading_round_id
      where reading_round.manuscript_version_id = p_manuscript_version_id
        and reading_round.status <> 'archived'
        and reader_assignment.reader_profile_id = (select auth.uid())
        and reader_assignment.status in ('pending', 'started', 'completed')
    )
  );
$$;

create or replace function private.ensure_reader_first_draft_access(
  p_manuscript_id uuid,
  p_reader_profile_id uuid,
  p_reader_email text,
  p_reader_display_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  first_round_id uuid;
  first_round_status public.reading_round_status;
  target_assignment_id uuid;
  target_assignment_status public.reader_assignment_status;
begin
  select reading_round.id, reading_round.status
  into first_round_id, first_round_status
  from public.manuscript_versions manuscript_version
  join public.reading_rounds reading_round
    on reading_round.manuscript_version_id = manuscript_version.id
  where manuscript_version.manuscript_id = p_manuscript_id
    and manuscript_version.archived_at is null
    and reading_round.status <> 'archived'
  order by manuscript_version.version_number asc, reading_round.created_at desc
  limit 1;

  if first_round_id is null then
    return;
  end if;

  select reader_assignment.id, reader_assignment.status
  into target_assignment_id, target_assignment_status
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = first_round_id
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
      first_round_id,
      p_reader_profile_id,
      lower(btrim(p_reader_email)),
      p_reader_display_name,
      case when first_round_status = 'open' then 'started'::public.reader_assignment_status else 'pending'::public.reader_assignment_status end,
      case when first_round_status = 'open' then now() else null end,
      case when first_round_status = 'open' then now() else null end
    )
    returning id into target_assignment_id;
  elsif target_assignment_status = 'revoked'
    or (target_assignment_status = 'pending' and first_round_status = 'open') then
    update public.reader_assignments
    set
      reader_email = lower(btrim(p_reader_email)),
      reader_display_name = p_reader_display_name,
      status = case when first_round_status = 'open' then 'started'::public.reader_assignment_status else 'pending'::public.reader_assignment_status end,
      started_at = case when first_round_status = 'open' then coalesce(started_at, now()) else started_at end,
      last_active_at = case when first_round_status = 'open' then coalesce(last_active_at, now()) else last_active_at end
    where id = target_assignment_id;
  end if;

  insert into public.reader_draft_access (reader_assignment_id)
  values (target_assignment_id)
  on conflict (reader_assignment_id) do nothing;
end;
$$;

create or replace function private.grant_first_draft_access_to_reader()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_manuscript_id uuid;
begin
  if tg_op = 'UPDATE'
    and old.reader_profile_id is not distinct from new.reader_profile_id
    and old.status is not distinct from new.status then
    return new;
  end if;

  if new.reading_invitation_id is null
    or new.reader_profile_id is null
    or new.status not in ('started', 'completed') then
    return new;
  end if;

  select manuscript_version.manuscript_id
  into target_manuscript_id
  from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  where reading_round.id = new.reading_round_id;

  if target_manuscript_id is not null then
    perform private.ensure_reader_first_draft_access(
      target_manuscript_id,
      new.reader_profile_id,
      new.reader_email,
      new.reader_display_name
    );
  end if;

  return new;
end;
$$;

drop trigger if exists reader_assignments_grant_first_draft_access on public.reader_assignments;
create trigger reader_assignments_grant_first_draft_access
after insert or update of reader_profile_id, status on public.reader_assignments
for each row
execute procedure private.grant_first_draft_access_to_reader();

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
