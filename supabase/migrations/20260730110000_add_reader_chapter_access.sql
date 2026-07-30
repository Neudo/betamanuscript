-- Reader access is scoped to explicit chapters inside a draft assignment.
-- Existing draft access is backfilled to preserve the previous full-draft behavior.

create table public.reader_assignment_chapter_access (
  reader_assignment_id uuid not null
    references public.reader_assignments(id) on delete cascade,
  chapter_id uuid not null
    references public.manuscript_chapters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reader_assignment_id, chapter_id)
);

create index reader_assignment_chapter_access_chapter_assignment_idx
  on public.reader_assignment_chapter_access (chapter_id, reader_assignment_id);

alter table public.reader_assignment_chapter_access enable row level security;

revoke all on table public.reader_assignment_chapter_access from public, anon;
grant select on table public.reader_assignment_chapter_access to authenticated;

create policy "Authors can view reader chapter access"
on public.reader_assignment_chapter_access
for select
to authenticated
using (
  exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.id = reader_assignment_chapter_access.reader_assignment_id
      and private.is_round_owner(reader_assignment.reading_round_id)
  )
);

create policy "Readers can view their chapter access"
on public.reader_assignment_chapter_access
for select
to authenticated
using (private.is_assignment_owner(reader_assignment_id));

insert into public.reader_assignment_chapter_access (
  reader_assignment_id,
  chapter_id
)
select
  reader_draft_access.reader_assignment_id,
  chapter.id
from public.reader_draft_access reader_draft_access
join public.reader_assignments reader_assignment
  on reader_assignment.id = reader_draft_access.reader_assignment_id
join public.reading_rounds reading_round
  on reading_round.id = reader_assignment.reading_round_id
join public.manuscript_chapters chapter
  on chapter.manuscript_version_id = reading_round.manuscript_version_id
where reading_round.status <> 'archived'
on conflict (reader_assignment_id, chapter_id) do nothing;

create or replace function private.seed_reader_assignment_chapter_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.reader_assignment_chapter_access chapter_access
    where chapter_access.reader_assignment_id = new.reader_assignment_id
  ) then
    return new;
  end if;

  insert into public.reader_assignment_chapter_access (
    reader_assignment_id,
    chapter_id
  )
  select
    new.reader_assignment_id,
    chapter.id
  from public.reader_assignments reader_assignment
  join public.reading_rounds reading_round
    on reading_round.id = reader_assignment.reading_round_id
  join public.manuscript_chapters chapter
    on chapter.manuscript_version_id = reading_round.manuscript_version_id
  where reader_assignment.id = new.reader_assignment_id
    and reading_round.status <> 'archived'
  on conflict (reader_assignment_id, chapter_id) do nothing;

  return new;
end;
$$;

revoke all on function private.seed_reader_assignment_chapter_access()
from public, anon, authenticated;

drop trigger if exists reader_draft_access_seed_chapter_access on public.reader_draft_access;
create trigger reader_draft_access_seed_chapter_access
after insert on public.reader_draft_access
for each row
execute procedure private.seed_reader_assignment_chapter_access();

create or replace function private.can_read_chapter(p_chapter_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reader_assignment_chapter_access chapter_access
    join public.reader_assignments reader_assignment
      on reader_assignment.id = chapter_access.reader_assignment_id
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    where chapter_access.chapter_id = p_chapter_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
  );
$$;

create or replace function private.can_assignment_access_chapter(
  p_reader_assignment_id uuid,
  p_chapter_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reader_assignment_chapter_access chapter_access
    join public.reader_assignments reader_assignment
      on reader_assignment.id = chapter_access.reader_assignment_id
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.manuscript_chapters chapter
      on chapter.id = chapter_access.chapter_id
      and chapter.manuscript_version_id = reading_round.manuscript_version_id
    where chapter_access.reader_assignment_id = p_reader_assignment_id
      and chapter_access.chapter_id = p_chapter_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
  );
$$;

drop policy if exists "Round owners and readers can read chapter progress" on public.chapter_reading_progress;
create policy "Round owners and readers can read chapter progress"
on public.chapter_reading_progress
for select
to authenticated
using (
  private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
  or exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.id = chapter_reading_progress.reader_assignment_id
      and private.is_round_owner(reader_assignment.reading_round_id)
  )
);

drop policy if exists "Readers can update chapter progress" on public.chapter_reading_progress;
create policy "Readers can update chapter progress"
on public.chapter_reading_progress
for update
to authenticated
using (private.can_assignment_access_chapter(reader_assignment_id, chapter_id))
with check (private.can_assignment_access_chapter(reader_assignment_id, chapter_id));

drop policy if exists "Readers can delete chapter progress" on public.chapter_reading_progress;
create policy "Readers can delete chapter progress"
on public.chapter_reading_progress
for delete
to authenticated
using (private.can_assignment_access_chapter(reader_assignment_id, chapter_id));

drop policy if exists "Chapter owners and readers can read annotations" on public.annotations;
create policy "Chapter owners and readers can read annotations"
on public.annotations
for select
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

drop policy if exists "Chapter owners and readers can update annotations" on public.annotations;
create policy "Chapter owners and readers can update annotations"
on public.annotations
for update
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
)
with check (
  private.is_chapter_owner(chapter_id)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

drop policy if exists "Chapter owners and readers can delete annotations" on public.annotations;
create policy "Chapter owners and readers can delete annotations"
on public.annotations
for delete
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

create or replace function private.can_assignment_answer_survey(
  p_reader_assignment_id uuid,
  p_survey_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.reader_assignments reader_assignment
    join public.reading_rounds reading_round
      on reading_round.id = reader_assignment.reading_round_id
    join public.surveys survey
      on survey.reading_round_id = reader_assignment.reading_round_id
    where reader_assignment.id = p_reader_assignment_id
      and private.is_assignment_owner(reader_assignment.id)
      and reading_round.status <> 'archived'
      and survey.id = p_survey_id
      and survey.status = 'active'
      and (
        (
          survey.trigger_type = 'after_chapter'
          and private.can_assignment_access_chapter(reader_assignment.id, survey.chapter_id)
          and exists (
            select 1
            from public.chapter_reading_progress chapter_progress
            where chapter_progress.reader_assignment_id = reader_assignment.id
              and chapter_progress.chapter_id = survey.chapter_id
              and chapter_progress.status = 'completed'
          )
        )
        or (
          survey.trigger_type = 'after_manuscript'
          and exists (
            select 1
            from public.reader_assignment_chapter_access chapter_access
            join public.manuscript_chapters chapter
              on chapter.id = chapter_access.chapter_id
            where chapter_access.reader_assignment_id = reader_assignment.id
              and chapter.manuscript_version_id = reading_round.manuscript_version_id
          )
          and not exists (
            select 1
            from public.reader_assignment_chapter_access chapter_access
            join public.manuscript_chapters chapter
              on chapter.id = chapter_access.chapter_id
            where chapter_access.reader_assignment_id = reader_assignment.id
              and chapter.manuscript_version_id = reading_round.manuscript_version_id
              and not exists (
                select 1
                from public.chapter_reading_progress chapter_progress
                where chapter_progress.reader_assignment_id = reader_assignment.id
                  and chapter_progress.chapter_id = chapter.id
                  and chapter_progress.status = 'completed'
              )
          )
        )
      )
  );
$$;

create or replace function private.can_read_survey(p_survey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_survey_owner(p_survey_id) or exists (
    select 1
    from public.surveys survey
    join public.reader_assignments reader_assignment
      on reader_assignment.reading_round_id = survey.reading_round_id
    where survey.id = p_survey_id
      and survey.status = 'active'
      and private.is_assignment_owner(reader_assignment.id)
      and (
        (
          survey.trigger_type = 'after_chapter'
          and private.can_assignment_access_chapter(reader_assignment.id, survey.chapter_id)
        )
        or (
          survey.trigger_type = 'after_manuscript'
          and exists (
            select 1
            from public.reader_assignment_chapter_access chapter_access
            where chapter_access.reader_assignment_id = reader_assignment.id
          )
        )
      )
  );
$$;

create or replace function public.set_reader_chapter_access(
  p_reader_assignment_id uuid,
  p_chapter_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_manuscript_version_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if p_chapter_ids is null or cardinality(p_chapter_ids) = 0 then
    raise exception 'Choose at least one chapter.' using errcode = '22023';
  end if;

  if cardinality(p_chapter_ids) <> (
    select count(distinct chapter_id)
    from unnest(p_chapter_ids) as requested(chapter_id)
  ) then
    raise exception 'Each chapter can only be selected once.' using errcode = '22023';
  end if;

  select reading_round.manuscript_version_id
  into target_manuscript_version_id
  from public.reader_assignments reader_assignment
  join public.reading_rounds reading_round
    on reading_round.id = reader_assignment.reading_round_id
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.status in ('pending', 'started', 'completed')
    and manuscript.owner_id = auth.uid()
    and manuscript.archived_at is null
    and manuscript_version.archived_at is null
    and reading_round.status <> 'archived'
  for update of reader_assignment;

  if target_manuscript_version_id is null then
    raise exception 'This reader access is unavailable or is not yours.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from unnest(p_chapter_ids) as requested(chapter_id)
    left join public.manuscript_chapters chapter
      on chapter.id = requested.chapter_id
      and chapter.manuscript_version_id = target_manuscript_version_id
    where chapter.id is null
  ) then
    raise exception 'Every selected chapter must belong to this draft.' using errcode = '22023';
  end if;

  delete from public.reader_assignment_chapter_access
  where reader_assignment_id = p_reader_assignment_id;

  insert into public.reader_assignment_chapter_access (
    reader_assignment_id,
    chapter_id
  )
  select p_reader_assignment_id, requested.chapter_id
  from unnest(p_chapter_ids) as requested(chapter_id);
end;
$$;

revoke all on function public.set_reader_chapter_access(uuid, uuid[])
from public, anon;
grant execute on function public.set_reader_chapter_access(uuid, uuid[])
to authenticated;

create or replace function public.create_manuscript_reader_invitation_with_chapters(
  p_manuscript_id uuid,
  p_recipient_email text,
  p_personal_note text,
  p_token_digest text,
  p_chapter_ids uuid[]
)
returns table (invitation_id uuid, expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_invitation_id uuid;
  invitation_expires_at timestamptz;
  target_assignment_id uuid;
begin
  select invitation.invitation_id, invitation.expires_at
  into created_invitation_id, invitation_expires_at
  from public.create_manuscript_reader_invitation(
    p_manuscript_id,
    p_recipient_email,
    p_personal_note,
    p_token_digest
  ) invitation;

  select reader_assignment.id
  into target_assignment_id
  from public.reader_assignments reader_assignment
  where reader_assignment.reading_invitation_id = created_invitation_id;

  if target_assignment_id is null then
    raise exception 'The invitation assignment could not be created.' using errcode = 'P0001';
  end if;

  perform public.set_reader_chapter_access(target_assignment_id, p_chapter_ids);

  return query select created_invitation_id, invitation_expires_at;
end;
$$;

revoke all on function public.create_manuscript_reader_invitation_with_chapters(uuid, text, text, text, uuid[])
from public, anon;
grant execute on function public.create_manuscript_reader_invitation_with_chapters(uuid, text, text, text, uuid[])
to authenticated;
