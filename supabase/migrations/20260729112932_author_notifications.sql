create table public.author_notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  new_annotation boolean not null default true,
  reader_progress boolean not null default false,
  survey_response boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.author_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_key text not null check (char_length(event_key) between 1 and 240),
  event_type text not null check (event_type in ('new_annotation', 'reader_started', 'reader_completed', 'survey_response')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 500),
  href text not null check (char_length(href) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, event_key)
);

create index author_notifications_profile_created_idx
  on public.author_notifications (profile_id, created_at desc);

create index author_notifications_unread_idx
  on public.author_notifications (profile_id, created_at desc)
  where read_at is null;

create trigger author_notification_preferences_set_updated_at
before update on public.author_notification_preferences
for each row execute procedure private.set_updated_at();

alter table public.author_notification_preferences enable row level security;
alter table public.author_notifications enable row level security;

revoke all on table public.author_notification_preferences, public.author_notifications
from anon, authenticated;

grant select, insert, update on table public.author_notification_preferences to authenticated;
grant select, update on table public.author_notifications to authenticated;

create policy "Authors can manage their notification preferences"
on public.author_notification_preferences for all to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create policy "Authors can read their notifications"
on public.author_notifications for select to authenticated
using ((select auth.uid()) = profile_id);

create policy "Authors can mark their notifications read"
on public.author_notifications for update to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create or replace function private.is_author_notification_enabled(
  p_profile_id uuid,
  p_event_type text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_event_type
    when 'new_annotation' then coalesce((
      select preference.new_annotation
      from public.author_notification_preferences preference
      where preference.profile_id = p_profile_id
    ), true)
    when 'survey_response' then coalesce((
      select preference.survey_response
      from public.author_notification_preferences preference
      where preference.profile_id = p_profile_id
    ), true)
    when 'reader_started' then coalesce((
      select preference.reader_progress
      from public.author_notification_preferences preference
      where preference.profile_id = p_profile_id
    ), false)
    when 'reader_completed' then coalesce((
      select preference.reader_progress
      from public.author_notification_preferences preference
      where preference.profile_id = p_profile_id
    ), false)
    else false
  end;
$$;

create or replace function private.create_author_notification(
  p_profile_id uuid,
  p_event_key text,
  p_event_type text,
  p_title text,
  p_body text,
  p_href text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_profile_id is null or not private.is_author_notification_enabled(p_profile_id, p_event_type) then
    return;
  end if;

  insert into public.author_notifications (
    profile_id,
    event_key,
    event_type,
    title,
    body,
    href
  ) values (
    p_profile_id,
    p_event_key,
    p_event_type,
    p_title,
    p_body,
    p_href
  )
  on conflict (profile_id, event_key) do nothing;
end;
$$;

create or replace function private.notify_author_on_annotation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
  target_manuscript_id uuid;
  target_version_id uuid;
  target_title text;
begin
  select manuscript.owner_id, manuscript.id, manuscript_version.id, manuscript_version.title
    into target_profile_id, target_manuscript_id, target_version_id, target_title
  from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = new.chapter_id;

  if target_profile_id is not null then
    perform private.create_author_notification(
      target_profile_id,
      'annotation:' || new.id::text,
      'new_annotation',
      'New feedback',
      'A reader left feedback on “' || target_title || '”.',
      '/dashboard/feedback?manuscriptId=' || target_manuscript_id::text || '&versionId=' || target_version_id::text
    );
  end if;

  return new;
end;
$$;

create or replace function private.notify_author_on_survey_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
  target_manuscript_id uuid;
  target_version_id uuid;
  target_title text;
begin
  select manuscript.owner_id, manuscript.id, manuscript_version.id, manuscript_version.title
    into target_profile_id, target_manuscript_id, target_version_id, target_title
  from public.surveys survey
  join public.reading_rounds reading_round on reading_round.id = survey.reading_round_id
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where survey.id = new.survey_id;

  if target_profile_id is not null then
    perform private.create_author_notification(
      target_profile_id,
      'survey-submission:' || new.id::text,
      'survey_response',
      'Survey response received',
      'A reader completed a survey for “' || target_title || '”.',
      '/dashboard/surveys?manuscriptId=' || target_manuscript_id::text || '&versionId=' || target_version_id::text
    );
  end if;

  return new;
end;
$$;

create or replace function private.notify_author_on_reader_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
  target_manuscript_id uuid;
  target_version_id uuid;
  target_title text;
  completed_chapter_count integer;
  total_chapter_count integer;
begin
  if new.status <> 'completed' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'completed' then
    return new;
  end if;

  select manuscript.owner_id, manuscript.id, manuscript_version.id, manuscript_version.title
    into target_profile_id, target_manuscript_id, target_version_id, target_title
  from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = new.chapter_id;

  select count(*)
    into completed_chapter_count
  from public.chapter_reading_progress chapter_progress
  join public.manuscript_chapters chapter on chapter.id = chapter_progress.chapter_id
  where chapter_progress.reader_assignment_id = new.reader_assignment_id
    and chapter.manuscript_version_id = target_version_id
    and chapter_progress.status = 'completed';

  select count(*)
    into total_chapter_count
  from public.manuscript_chapters chapter
  where chapter.manuscript_version_id = target_version_id;

  if target_profile_id is null or total_chapter_count = 0 then
    return new;
  end if;

  if completed_chapter_count = 1 and total_chapter_count > 1 then
    perform private.create_author_notification(
      target_profile_id,
      'reader-started:' || new.reader_assignment_id::text || ':' || target_version_id::text,
      'reader_started',
      'A reader started reading',
      'A reader completed the first chapter of “' || target_title || '”.',
      '/dashboard/readers?manuscriptId=' || target_manuscript_id::text || '&versionId=' || target_version_id::text
    );
  elsif completed_chapter_count = total_chapter_count then
    perform private.create_author_notification(
      target_profile_id,
      'reader-completed:' || new.reader_assignment_id::text || ':' || target_version_id::text,
      'reader_completed',
      'A reader finished reading',
      'A reader completed every chapter of “' || target_title || '”.',
      '/dashboard/readers?manuscriptId=' || target_manuscript_id::text || '&versionId=' || target_version_id::text
    );
  end if;

  return new;
end;
$$;

create trigger annotations_notify_author
after insert on public.annotations
for each row execute procedure private.notify_author_on_annotation();

create trigger survey_submissions_notify_author
after update of status on public.survey_submissions
for each row
when (new.status = 'submitted' and old.status is distinct from new.status)
execute procedure private.notify_author_on_survey_submission();

create trigger chapter_reading_progress_notify_author
after insert or update of status on public.chapter_reading_progress
for each row execute procedure private.notify_author_on_reader_progress();

revoke all on function private.is_author_notification_enabled(uuid, text)
from public, anon, authenticated;
revoke all on function private.create_author_notification(uuid, text, text, text, text, text)
from public, anon, authenticated;
revoke all on function private.notify_author_on_annotation()
from public, anon, authenticated;
revoke all on function private.notify_author_on_survey_submission()
from public, anon, authenticated;
revoke all on function private.notify_author_on_reader_progress()
from public, anon, authenticated;
