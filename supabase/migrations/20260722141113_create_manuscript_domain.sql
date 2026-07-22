-- This baseline includes the final, optimized policy set for the manuscript domain.
-- It reproduces the same end state as the two remote migrations applied on 2026-07-22.

create type public.word_count_band as enum ('under_40k', '40k_80k', '80k_120k', '120k_plus');
create type public.manuscript_version_status as enum ('draft', 'ready', 'archived');
create type public.chapter_editorial_status as enum ('draft', 'needs_work', 'complete');
create type public.chapter_block_kind as enum ('paragraph', 'scene_break', 'heading', 'blockquote');
create type public.manuscript_asset_kind as enum ('cover', 'source_document');
create type public.manuscript_asset_processing_status as enum ('pending', 'available', 'failed');
create type public.reading_round_status as enum ('draft', 'open', 'closed', 'archived');
create type public.reading_access_mode as enum ('invite_only', 'open_signup');
create type public.reading_invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
create type public.reader_assignment_status as enum ('active', 'completed', 'revoked');
create type public.chapter_reading_status as enum ('in_progress', 'completed');
create type public.survey_status as enum ('draft', 'active', 'closed');
create type public.survey_trigger_type as enum ('after_chapter', 'after_manuscript');
create type public.survey_question_type as enum ('rating', 'yes_no', 'multiple_choice', 'open_text');
create type public.survey_submission_status as enum ('in_progress', 'submitted');

create table public.manuscripts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  internal_title text not null check (char_length(trim(internal_title)) between 1 and 300),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.genres (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label text not null check (char_length(trim(label)) between 1 and 80),
  sort_order smallint not null check (sort_order > 0),
  is_active boolean not null default true,
  unique (sort_order)
);

create table public.manuscript_versions (
  id uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  title text not null check (char_length(trim(title)) between 1 and 300),
  logline text check (logline is null or char_length(logline) <= 2000),
  estimated_word_count_band public.word_count_band,
  status public.manuscript_version_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manuscript_id, version_number)
);

create table public.manuscript_version_genres (
  manuscript_version_id uuid not null references public.manuscript_versions(id) on delete cascade,
  genre_slug text not null references public.genres(slug) on delete restrict,
  sort_order smallint not null check (sort_order > 0),
  primary key (manuscript_version_id, genre_slug),
  unique (manuscript_version_id, sort_order)
);

create table public.manuscript_chapters (
  id uuid primary key default gen_random_uuid(),
  manuscript_version_id uuid not null references public.manuscript_versions(id) on delete cascade,
  position integer not null check (position > 0),
  title text not null check (char_length(trim(title)) between 1 and 500),
  editorial_status public.chapter_editorial_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manuscript_version_id, position)
);

create table public.chapter_blocks (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.manuscript_chapters(id) on delete cascade,
  position integer not null check (position > 0),
  kind public.chapter_block_kind not null default 'paragraph',
  content text not null default '' check (char_length(content) <= 25000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chapter_id, position)
);

create table public.manuscript_assets (
  id uuid primary key default gen_random_uuid(),
  manuscript_version_id uuid not null references public.manuscript_versions(id) on delete cascade,
  asset_kind public.manuscript_asset_kind not null,
  storage_bucket text not null check (char_length(storage_bucket) between 1 and 63),
  storage_path text not null check (char_length(storage_path) between 1 and 1024),
  original_filename text not null check (char_length(trim(original_filename)) between 1 and 512),
  mime_type text check (mime_type is null or char_length(mime_type) <= 255),
  byte_size bigint check (byte_size is null or byte_size >= 0),
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
  processing_status public.manuscript_asset_processing_status not null default 'pending',
  processing_error text check (processing_error is null or char_length(processing_error) <= 2000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table public.reading_rounds (
  id uuid primary key default gen_random_uuid(),
  manuscript_version_id uuid not null references public.manuscript_versions(id) on delete cascade,
  name text not null default 'Beta reading' check (char_length(trim(name)) between 1 and 160),
  status public.reading_round_status not null default 'draft',
  access_mode public.reading_access_mode not null default 'invite_only',
  max_readers integer not null default 5 check (max_readers > 0),
  reading_deadline date,
  reader_note text check (reader_note is null or char_length(reader_note) <= 4000),
  welcome_message text check (welcome_message is null or char_length(welcome_message) <= 4000),
  show_author_profile boolean not null default true,
  opened_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (closed_at is null or opened_at is not null)
);

create table public.reading_invitations (
  id uuid primary key default gen_random_uuid(),
  reading_round_id uuid not null references public.reading_rounds(id) on delete cascade,
  recipient_email text not null check (
    recipient_email = lower(btrim(recipient_email))
    and position('@' in recipient_email) > 1
    and char_length(recipient_email) <= 320
  ),
  personal_note text check (personal_note is null or char_length(personal_note) <= 4000),
  token_digest text not null unique check (token_digest ~ '^[a-f0-9]{64}$'),
  status public.reading_invitation_status not null default 'pending',
  expires_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  accepted_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reading_round_access_links (
  id uuid primary key default gen_random_uuid(),
  reading_round_id uuid not null references public.reading_rounds(id) on delete cascade,
  token_digest text not null unique check (token_digest ~ '^[a-f0-9]{64}$'),
  max_uses integer check (max_uses is null or max_uses > 0),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reader_assignments (
  id uuid primary key default gen_random_uuid(),
  reading_round_id uuid not null references public.reading_rounds(id) on delete cascade,
  reader_profile_id uuid references public.profiles(id) on delete set null,
  reading_invitation_id uuid references public.reading_invitations(id) on delete set null,
  reader_email text not null check (
    reader_email = lower(btrim(reader_email))
    and position('@' in reader_email) > 1
    and char_length(reader_email) <= 320
  ),
  reader_display_name text check (
    reader_display_name is null or char_length(trim(reader_display_name)) between 1 and 80
  ),
  status public.reader_assignment_status not null default 'active',
  started_at timestamptz,
  completed_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is not null)
);

create table public.chapter_reading_progress (
  id uuid primary key default gen_random_uuid(),
  reader_assignment_id uuid not null references public.reader_assignments(id) on delete cascade,
  chapter_id uuid not null references public.manuscript_chapters(id) on delete cascade,
  last_block_id uuid references public.chapter_blocks(id) on delete set null,
  last_offset integer check (last_offset is null or last_offset >= 0),
  status public.chapter_reading_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reader_assignment_id, chapter_id),
  check (completed_at is null or completed_at >= started_at)
);

create table public.annotation_tags (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label text not null check (char_length(trim(label)) between 1 and 80),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order smallint not null check (sort_order > 0),
  is_active boolean not null default true,
  unique (sort_order)
);

create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  reader_assignment_id uuid not null references public.reader_assignments(id) on delete cascade,
  chapter_id uuid not null references public.manuscript_chapters(id) on delete cascade,
  chapter_block_id uuid not null references public.chapter_blocks(id) on delete restrict,
  tag_slug text not null references public.annotation_tags(slug) on delete restrict,
  quote text not null check (char_length(quote) between 1 and 10000),
  selection_start integer not null default 0 check (selection_start >= 0),
  selection_end integer not null check (selection_end >= 0),
  context_before text check (context_before is null or char_length(context_before) <= 1000),
  context_after text check (context_after is null or char_length(context_after) <= 1000),
  comment text check (comment is null or char_length(comment) <= 4000),
  author_seen_at timestamptz,
  author_resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (selection_end >= selection_start)
);

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  reading_round_id uuid not null references public.reading_rounds(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 200),
  status public.survey_status not null default 'draft',
  trigger_type public.survey_trigger_type not null,
  chapter_id uuid references public.manuscript_chapters(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (trigger_type = 'after_chapter' and chapter_id is not null)
    or (trigger_type = 'after_manuscript' and chapter_id is null)
  )
);

create table public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  position integer not null check (position > 0),
  question_type public.survey_question_type not null,
  prompt text not null check (char_length(trim(prompt)) between 1 and 2000),
  is_required boolean not null default false,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (survey_id, position)
);

create table public.survey_question_options (
  id uuid primary key default gen_random_uuid(),
  survey_question_id uuid not null references public.survey_questions(id) on delete cascade,
  position integer not null check (position > 0),
  label text not null check (char_length(trim(label)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (survey_question_id, position)
);

create table public.survey_submissions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  reader_assignment_id uuid not null references public.reader_assignments(id) on delete cascade,
  status public.survey_submission_status not null default 'in_progress',
  opened_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (survey_id, reader_assignment_id),
  check (submitted_at is null or submitted_at >= opened_at)
);

create table public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  survey_submission_id uuid not null references public.survey_submissions(id) on delete cascade,
  survey_question_id uuid not null references public.survey_questions(id) on delete cascade,
  text_value text,
  number_value numeric,
  boolean_value boolean,
  selected_option_id uuid references public.survey_question_options(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(text_value, number_value, boolean_value, selected_option_id) = 1),
  unique (survey_submission_id, survey_question_id)
);

insert into public.genres (slug, label, sort_order) values
  ('literary-fiction', 'Literary fiction', 1),
  ('fantasy', 'Fantasy', 2),
  ('science-fiction', 'Science fiction', 3),
  ('historical-fiction', 'Historical fiction', 4),
  ('thriller-mystery', 'Thriller / Mystery', 5),
  ('romance', 'Romance', 6),
  ('horror', 'Horror', 7),
  ('young-adult', 'Young adult', 8),
  ('other', 'Other', 9);

insert into public.annotation_tags (slug, label, color, sort_order) values
  ('confusing', 'Confusing', '#8A6D1D', 1),
  ('pacing', 'Pacing issue', '#8A6D1D', 2),
  ('missing-context', 'Missing context', '#8A6D1D', 3),
  ('strong-line', 'Strong line', '#2C3E2D', 4),
  ('emotional-impact', 'Emotional impact', '#7B1D1D', 5),
  ('character', 'Character', '#3B4A8A', 6),
  ('worldbuilding', 'Worldbuilding', '#3B4A8A', 7),
  ('prose', 'Prose', '#2C3E2D', 8);

create or replace function private.is_manuscript_owner(p_manuscript_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.manuscripts manuscript
  where manuscript.id = p_manuscript_id and manuscript.owner_id = (select auth.uid())
); $$;

create or replace function private.is_manuscript_version_owner(p_manuscript_version_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_manuscript_version_id
    and manuscript.owner_id = (select auth.uid())
); $$;

create or replace function private.is_chapter_owner(p_chapter_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = p_chapter_id and manuscript.owner_id = (select auth.uid())
); $$;

create or replace function private.is_round_owner(p_reading_round_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.reading_rounds reading_round
  join public.manuscript_versions manuscript_version on manuscript_version.id = reading_round.manuscript_version_id
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where reading_round.id = p_reading_round_id and manuscript.owner_id = (select auth.uid())
); $$;

create or replace function private.is_assignment_owner(p_reader_assignment_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.reader_assignments reader_assignment
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status in ('active', 'completed')
); $$;

create or replace function private.has_round_assignment(p_reading_round_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1 from public.reader_assignments reader_assignment
  where reader_assignment.reading_round_id = p_reading_round_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status in ('active', 'completed')
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
      and reader_assignment.status in ('active', 'completed')
      and reading_round.status in ('open', 'closed')
  )
); $$;

create or replace function private.can_read_chapter(p_chapter_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.manuscript_chapters chapter
  where chapter.id = p_chapter_id and private.can_read_manuscript_version(chapter.manuscript_version_id)
); $$;

create or replace function private.can_read_round(p_reading_round_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select private.is_round_owner(p_reading_round_id) or private.has_round_assignment(p_reading_round_id); $$;

create or replace function private.can_assignment_access_chapter(p_reader_assignment_id uuid, p_chapter_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1
  from public.reader_assignments reader_assignment
  join public.reading_rounds reading_round on reading_round.id = reader_assignment.reading_round_id
  join public.manuscript_chapters chapter on chapter.manuscript_version_id = reading_round.manuscript_version_id
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status = 'active'
    and reading_round.status = 'open'
    and chapter.id = p_chapter_id
); $$;

create or replace function private.is_survey_owner(p_survey_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.surveys survey
  where survey.id = p_survey_id and private.is_round_owner(survey.reading_round_id)
); $$;

create or replace function private.can_read_survey(p_survey_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select private.is_survey_owner(p_survey_id) or exists (
  select 1 from public.surveys survey
  where survey.id = p_survey_id and survey.status = 'active'
    and private.has_round_assignment(survey.reading_round_id)
); $$;

create or replace function private.is_survey_question_owner(p_survey_question_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.survey_questions survey_question
  where survey_question.id = p_survey_question_id and private.is_survey_owner(survey_question.survey_id)
); $$;

create or replace function private.can_read_survey_question(p_survey_question_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.survey_questions survey_question
  where survey_question.id = p_survey_question_id and private.can_read_survey(survey_question.survey_id)
); $$;

create or replace function private.can_assignment_answer_survey(p_reader_assignment_id uuid, p_survey_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select (select auth.uid()) is not null and exists (
  select 1
  from public.reader_assignments reader_assignment
  join public.surveys survey on survey.reading_round_id = reader_assignment.reading_round_id
  where reader_assignment.id = p_reader_assignment_id
    and reader_assignment.reader_profile_id = (select auth.uid())
    and reader_assignment.status = 'active'
    and survey.id = p_survey_id
    and survey.status = 'active'
); $$;

create or replace function private.is_submission_owner(p_survey_submission_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (
  select 1 from public.survey_submissions survey_submission
  where survey_submission.id = p_survey_submission_id
    and private.is_assignment_owner(survey_submission.reader_assignment_id)
); $$;

create or replace function private.can_read_survey_submission(p_survey_submission_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select private.is_submission_owner(p_survey_submission_id) or exists (
  select 1 from public.survey_submissions survey_submission
  where survey_submission.id = p_survey_submission_id
    and private.is_survey_owner(survey_submission.survey_id)
); $$;

create or replace function private.enforce_manuscript_plan_limit()
returns trigger language plpgsql security definer set search_path = ''
as $$ declare current_plan public.account_plan; begin
  select profile.plan into current_plan from public.profiles profile
  where profile.id = new.owner_id for update;
  if current_plan is null then raise exception 'The manuscript owner must have a profile.'; end if;
  if current_plan = 'free' and new.archived_at is null and (
    select count(*) from public.manuscripts manuscript
    where manuscript.owner_id = new.owner_id and manuscript.archived_at is null
      and (tg_op = 'INSERT' or manuscript.id <> new.id)
  ) >= 1 then raise exception 'The free plan is limited to one active manuscript.'; end if;
  return new;
end; $$;

create or replace function private.enforce_reading_round_plan_limit()
returns trigger language plpgsql security definer set search_path = ''
as $$ declare current_plan public.account_plan; assigned_readers integer; begin
  select profile.plan into current_plan
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  join public.profiles profile on profile.id = manuscript.owner_id
  where manuscript_version.id = new.manuscript_version_id for update of profile;
  if current_plan is null then raise exception 'The reading round must belong to a manuscript owner profile.'; end if;
  if current_plan = 'free' and new.max_readers > 5 then raise exception 'The free plan is limited to five readers per reading round.'; end if;
  if tg_op = 'UPDATE' then
    select count(*) into assigned_readers from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = new.id and reader_assignment.status <> 'revoked';
    if assigned_readers > new.max_readers then raise exception 'The reader limit cannot be lower than the current active reader count.'; end if;
  end if;
  return new;
end; $$;

create or replace function private.enforce_reading_round_capacity()
returns trigger language plpgsql security definer set search_path = ''
as $$ declare capacity integer; round_status public.reading_round_status; occupied_slots integer; should_check boolean; begin
  should_check := tg_op = 'INSERT'
    or old.reading_round_id is distinct from new.reading_round_id
    or (old.status = 'revoked' and new.status <> 'revoked');
  if new.status <> 'revoked' and should_check then
    select reading_round.max_readers, reading_round.status into capacity, round_status
    from public.reading_rounds reading_round where reading_round.id = new.reading_round_id for update;
    if round_status not in ('draft', 'open') then raise exception 'Readers cannot be added to a closed or archived reading round.'; end if;
    select count(*) into occupied_slots from public.reader_assignments reader_assignment
    where reader_assignment.reading_round_id = new.reading_round_id
      and reader_assignment.status <> 'revoked'
      and (tg_op = 'INSERT' or reader_assignment.id <> new.id);
    if occupied_slots >= capacity then raise exception 'This reading round has reached its reader limit.'; end if;
  end if;
  return new;
end; $$;

create or replace function private.prevent_shared_version_metadata_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$ begin
  if exists (
    select 1 from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = old.id and reading_round.status in ('open', 'closed')
  ) and (
    new.title is distinct from old.title
    or new.logline is distinct from old.logline
    or new.estimated_word_count_band is distinct from old.estimated_word_count_band
  ) then raise exception 'Create a new manuscript version instead of changing a version that has been shared with readers.'; end if;
  return new;
end; $$;

create or replace function private.prevent_shared_chapter_structure_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$ begin
  if exists (
    select 1 from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = old.manuscript_version_id
      and reading_round.status in ('open', 'closed')
  ) and (
    tg_op = 'DELETE'
    or new.manuscript_version_id is distinct from old.manuscript_version_id
    or new.position is distinct from old.position
    or new.title is distinct from old.title
  ) then raise exception 'Create a new manuscript version instead of changing chapters already shared with readers.'; end if;
  return coalesce(new, old);
end; $$;

create or replace function private.prevent_shared_block_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$ declare target_chapter_id uuid; begin
  if tg_op = 'DELETE' then target_chapter_id := old.chapter_id; else target_chapter_id := new.chapter_id; end if;
  if exists (
    select 1 from public.manuscript_chapters chapter
    join public.reading_rounds reading_round on reading_round.manuscript_version_id = chapter.manuscript_version_id
    where chapter.id = target_chapter_id and reading_round.status in ('open', 'closed')
  ) then raise exception 'Create a new manuscript version instead of changing text already shared with readers.'; end if;
  return coalesce(new, old);
end; $$;

create or replace function private.validate_survey_trigger()
returns trigger language plpgsql security definer set search_path = ''
as $$ begin
  if new.trigger_type = 'after_chapter' and not exists (
    select 1 from public.reading_rounds reading_round
    join public.manuscript_chapters chapter on chapter.manuscript_version_id = reading_round.manuscript_version_id
    where reading_round.id = new.reading_round_id and chapter.id = new.chapter_id
  ) then raise exception 'The survey chapter must belong to the reading round manuscript version.'; end if;
  return new;
end; $$;

create or replace function private.validate_survey_answer()
returns trigger language plpgsql security definer set search_path = ''
as $$ declare expected_question_type public.survey_question_type; begin
  select survey_question.question_type into expected_question_type
  from public.survey_submissions survey_submission
  join public.survey_questions survey_question on survey_question.survey_id = survey_submission.survey_id
  where survey_submission.id = new.survey_submission_id and survey_question.id = new.survey_question_id;
  if expected_question_type is null then raise exception 'The answer question must belong to the submission survey.'; end if;
  if expected_question_type = 'rating' and new.number_value is null then raise exception 'A rating answer requires a numeric value.';
  elsif expected_question_type = 'yes_no' and new.boolean_value is null then raise exception 'A yes/no answer requires a boolean value.';
  elsif expected_question_type = 'multiple_choice' and (
    new.selected_option_id is null or not exists (
      select 1 from public.survey_question_options survey_question_option
      where survey_question_option.id = new.selected_option_id
        and survey_question_option.survey_question_id = new.survey_question_id
    )
  ) then raise exception 'A multiple choice answer requires an option from the selected question.';
  elsif expected_question_type = 'open_text' and new.text_value is null then raise exception 'An open text answer requires text.';
  end if;
  return new;
end; $$;

create or replace function private.prevent_progress_identity_changes()
returns trigger language plpgsql security definer set search_path = ''
as $$ begin
  if new.reader_assignment_id is distinct from old.reader_assignment_id
    or new.chapter_id is distinct from old.chapter_id
  then raise exception 'Reading progress cannot be moved to a different reader or chapter.'; end if;
  return new;
end; $$;

revoke all on function
  private.is_manuscript_owner(uuid),
  private.is_manuscript_version_owner(uuid),
  private.is_chapter_owner(uuid),
  private.is_round_owner(uuid),
  private.is_assignment_owner(uuid),
  private.has_round_assignment(uuid),
  private.can_read_manuscript_version(uuid),
  private.can_read_chapter(uuid),
  private.can_read_round(uuid),
  private.can_assignment_access_chapter(uuid, uuid),
  private.is_survey_owner(uuid),
  private.can_read_survey(uuid),
  private.is_survey_question_owner(uuid),
  private.can_read_survey_question(uuid),
  private.can_assignment_answer_survey(uuid, uuid),
  private.is_submission_owner(uuid),
  private.can_read_survey_submission(uuid)
from public, anon, authenticated;

grant execute on function
  private.is_manuscript_owner(uuid),
  private.is_manuscript_version_owner(uuid),
  private.is_chapter_owner(uuid),
  private.is_round_owner(uuid),
  private.is_assignment_owner(uuid),
  private.has_round_assignment(uuid),
  private.can_read_manuscript_version(uuid),
  private.can_read_chapter(uuid),
  private.can_read_round(uuid),
  private.can_assignment_access_chapter(uuid, uuid),
  private.is_survey_owner(uuid),
  private.can_read_survey(uuid),
  private.is_survey_question_owner(uuid),
  private.can_read_survey_question(uuid),
  private.can_assignment_answer_survey(uuid, uuid),
  private.is_submission_owner(uuid),
  private.can_read_survey_submission(uuid)
to authenticated;

revoke all on function
  private.enforce_manuscript_plan_limit(),
  private.enforce_reading_round_plan_limit(),
  private.enforce_reading_round_capacity(),
  private.prevent_shared_version_metadata_changes(),
  private.prevent_shared_chapter_structure_changes(),
  private.prevent_shared_block_changes(),
  private.validate_survey_trigger(),
  private.validate_survey_answer(),
  private.prevent_progress_identity_changes()
from public, anon, authenticated;

create trigger manuscripts_enforce_plan_limit before insert or update of owner_id, archived_at on public.manuscripts
for each row execute procedure private.enforce_manuscript_plan_limit();
create trigger manuscript_versions_prevent_shared_metadata_changes before update on public.manuscript_versions
for each row execute procedure private.prevent_shared_version_metadata_changes();
create trigger manuscript_chapters_prevent_shared_structure_changes before update or delete on public.manuscript_chapters
for each row execute procedure private.prevent_shared_chapter_structure_changes();
create trigger chapter_blocks_prevent_shared_changes before insert or update or delete on public.chapter_blocks
for each row execute procedure private.prevent_shared_block_changes();
create trigger reading_rounds_enforce_plan_limit before insert or update of manuscript_version_id, max_readers on public.reading_rounds
for each row execute procedure private.enforce_reading_round_plan_limit();
create trigger reader_assignments_enforce_capacity before insert or update of reading_round_id, status on public.reader_assignments
for each row execute procedure private.enforce_reading_round_capacity();
create trigger surveys_validate_trigger before insert or update of reading_round_id, trigger_type, chapter_id on public.surveys
for each row execute procedure private.validate_survey_trigger();
create trigger survey_answers_validate_value before insert or update on public.survey_answers
for each row execute procedure private.validate_survey_answer();
create trigger chapter_reading_progress_prevent_identity_changes before update on public.chapter_reading_progress
for each row execute procedure private.prevent_progress_identity_changes();

create trigger manuscripts_set_updated_at before update on public.manuscripts for each row execute procedure private.set_updated_at();
create trigger manuscript_versions_set_updated_at before update on public.manuscript_versions for each row execute procedure private.set_updated_at();
create trigger manuscript_chapters_set_updated_at before update on public.manuscript_chapters for each row execute procedure private.set_updated_at();
create trigger chapter_blocks_set_updated_at before update on public.chapter_blocks for each row execute procedure private.set_updated_at();
create trigger manuscript_assets_set_updated_at before update on public.manuscript_assets for each row execute procedure private.set_updated_at();
create trigger reading_rounds_set_updated_at before update on public.reading_rounds for each row execute procedure private.set_updated_at();
create trigger reading_invitations_set_updated_at before update on public.reading_invitations for each row execute procedure private.set_updated_at();
create trigger reading_round_access_links_set_updated_at before update on public.reading_round_access_links for each row execute procedure private.set_updated_at();
create trigger reader_assignments_set_updated_at before update on public.reader_assignments for each row execute procedure private.set_updated_at();
create trigger chapter_reading_progress_set_updated_at before update on public.chapter_reading_progress for each row execute procedure private.set_updated_at();
create trigger annotations_set_updated_at before update on public.annotations for each row execute procedure private.set_updated_at();
create trigger surveys_set_updated_at before update on public.surveys for each row execute procedure private.set_updated_at();
create trigger survey_questions_set_updated_at before update on public.survey_questions for each row execute procedure private.set_updated_at();
create trigger survey_question_options_set_updated_at before update on public.survey_question_options for each row execute procedure private.set_updated_at();
create trigger survey_submissions_set_updated_at before update on public.survey_submissions for each row execute procedure private.set_updated_at();
create trigger survey_answers_set_updated_at before update on public.survey_answers for each row execute procedure private.set_updated_at();

create index manuscripts_owner_active_idx on public.manuscripts (owner_id) where archived_at is null;
create index manuscript_versions_manuscript_status_idx on public.manuscript_versions (manuscript_id, status) where archived_at is null;
create index manuscript_chapters_version_position_idx on public.manuscript_chapters (manuscript_version_id, position);
create index chapter_blocks_chapter_position_idx on public.chapter_blocks (chapter_id, position);
create index manuscript_assets_version_kind_idx on public.manuscript_assets (manuscript_version_id, asset_kind);
create index reading_rounds_version_status_idx on public.reading_rounds (manuscript_version_id, status);
create index reading_invitations_round_status_idx on public.reading_invitations (reading_round_id, status);
create unique index reading_round_access_links_active_round_idx on public.reading_round_access_links (reading_round_id) where revoked_at is null;
create index reader_assignments_round_status_idx on public.reader_assignments (reading_round_id, status);
create unique index reader_assignments_round_profile_idx on public.reader_assignments (reading_round_id, reader_profile_id) where reader_profile_id is not null;
create unique index reader_assignments_round_email_idx on public.reader_assignments (reading_round_id, reader_email);
create index chapter_reading_progress_chapter_idx on public.chapter_reading_progress (chapter_id);
create index annotations_chapter_tag_created_idx on public.annotations (chapter_id, tag_slug, created_at desc);
create index annotations_assignment_created_idx on public.annotations (reader_assignment_id, created_at desc);
create index surveys_round_status_idx on public.surveys (reading_round_id, status);
create index survey_questions_survey_position_idx on public.survey_questions (survey_id, position);
create index survey_submissions_assignment_idx on public.survey_submissions (reader_assignment_id);
create index survey_answers_question_idx on public.survey_answers (survey_question_id);
create index annotations_chapter_block_idx on public.annotations (chapter_block_id);
create index annotations_tag_idx on public.annotations (tag_slug);
create index chapter_reading_progress_last_block_idx on public.chapter_reading_progress (last_block_id);
create index manuscript_version_genres_genre_idx on public.manuscript_version_genres (genre_slug);
create index manuscript_versions_created_by_idx on public.manuscript_versions (created_by);
create index reader_assignments_reader_profile_idx on public.reader_assignments (reader_profile_id);
create index reader_assignments_invitation_idx on public.reader_assignments (reading_invitation_id);
create index reading_invitations_accepted_by_profile_idx on public.reading_invitations (accepted_by_profile_id);
create index survey_answers_selected_option_idx on public.survey_answers (selected_option_id);
create index surveys_chapter_idx on public.surveys (chapter_id);

alter table public.manuscripts enable row level security;
alter table public.genres enable row level security;
alter table public.manuscript_versions enable row level security;
alter table public.manuscript_version_genres enable row level security;
alter table public.manuscript_chapters enable row level security;
alter table public.chapter_blocks enable row level security;
alter table public.manuscript_assets enable row level security;
alter table public.reading_rounds enable row level security;
alter table public.reading_invitations enable row level security;
alter table public.reading_round_access_links enable row level security;
alter table public.reader_assignments enable row level security;
alter table public.chapter_reading_progress enable row level security;
alter table public.annotation_tags enable row level security;
alter table public.annotations enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_question_options enable row level security;
alter table public.survey_submissions enable row level security;
alter table public.survey_answers enable row level security;

revoke all on table
  public.manuscripts, public.genres, public.manuscript_versions, public.manuscript_version_genres,
  public.manuscript_chapters, public.chapter_blocks, public.manuscript_assets, public.reading_rounds,
  public.reading_invitations, public.reading_round_access_links, public.reader_assignments,
  public.chapter_reading_progress, public.annotation_tags, public.annotations, public.surveys,
  public.survey_questions, public.survey_question_options, public.survey_submissions, public.survey_answers
from anon, authenticated;

grant select, insert, update, delete on table
  public.manuscripts, public.manuscript_versions, public.manuscript_version_genres,
  public.manuscript_chapters, public.chapter_blocks, public.manuscript_assets, public.reading_rounds,
  public.reading_invitations, public.reading_round_access_links, public.reader_assignments,
  public.chapter_reading_progress, public.annotations, public.surveys, public.survey_questions,
  public.survey_question_options, public.survey_submissions, public.survey_answers
to authenticated;
grant select on table public.genres, public.annotation_tags to authenticated;

create policy "Manuscript owners can select their manuscripts"
on public.manuscripts for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Authenticated writers can create their manuscripts"
on public.manuscripts for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Manuscript owners can update their manuscripts"
on public.manuscripts for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Manuscript owners can delete their manuscripts"
on public.manuscripts for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "Authenticated users can read genre catalog"
on public.genres for select to authenticated using (true);

create policy "Owners and assigned readers can read versions"
on public.manuscript_versions for select to authenticated
using (private.is_manuscript_owner(manuscript_id) or private.can_read_manuscript_version(id));
create policy "Manuscript owners can create versions"
on public.manuscript_versions for insert to authenticated with check (private.is_manuscript_owner(manuscript_id));
create policy "Version owners can update versions"
on public.manuscript_versions for update to authenticated
using (private.is_manuscript_version_owner(id)) with check (private.is_manuscript_owner(manuscript_id));
create policy "Version owners can delete versions"
on public.manuscript_versions for delete to authenticated using (private.is_manuscript_version_owner(id));

create policy "Owners and assigned readers can read version genres"
on public.manuscript_version_genres for select to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id) or private.can_read_manuscript_version(manuscript_version_id));
create policy "Version owners can insert version genres"
on public.manuscript_version_genres for insert to authenticated with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Version owners can update version genres"
on public.manuscript_version_genres for update to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id)) with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Version owners can delete version genres"
on public.manuscript_version_genres for delete to authenticated using (private.is_manuscript_version_owner(manuscript_version_id));

create policy "Owners and assigned readers can read chapters"
on public.manuscript_chapters for select to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id) or private.can_read_chapter(id));
create policy "Version owners can insert chapters"
on public.manuscript_chapters for insert to authenticated with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Version owners can update chapters"
on public.manuscript_chapters for update to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id)) with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Version owners can delete chapters"
on public.manuscript_chapters for delete to authenticated using (private.is_manuscript_version_owner(manuscript_version_id));

create policy "Owners and assigned readers can read chapter blocks"
on public.chapter_blocks for select to authenticated
using (private.is_chapter_owner(chapter_id) or private.can_read_chapter(chapter_id));
create policy "Chapter owners can insert chapter blocks"
on public.chapter_blocks for insert to authenticated with check (private.is_chapter_owner(chapter_id));
create policy "Chapter owners can update chapter blocks"
on public.chapter_blocks for update to authenticated
using (private.is_chapter_owner(chapter_id)) with check (private.is_chapter_owner(chapter_id));
create policy "Chapter owners can delete chapter blocks"
on public.chapter_blocks for delete to authenticated using (private.is_chapter_owner(chapter_id));

create policy "Owners and assigned readers can read permitted assets"
on public.manuscript_assets for select to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id) or (asset_kind = 'cover' and private.can_read_manuscript_version(manuscript_version_id)));
create policy "Version owners can insert manuscript assets"
on public.manuscript_assets for insert to authenticated with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Version owners can update manuscript assets"
on public.manuscript_assets for update to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id)) with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Version owners can delete manuscript assets"
on public.manuscript_assets for delete to authenticated using (private.is_manuscript_version_owner(manuscript_version_id));

create policy "Owners and assigned readers can read rounds"
on public.reading_rounds for select to authenticated
using (private.is_manuscript_version_owner(manuscript_version_id) or private.has_round_assignment(id));
create policy "Version owners can create reading rounds"
on public.reading_rounds for insert to authenticated with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Round owners can update reading rounds"
on public.reading_rounds for update to authenticated
using (private.is_round_owner(id)) with check (private.is_manuscript_version_owner(manuscript_version_id));
create policy "Round owners can delete reading rounds"
on public.reading_rounds for delete to authenticated using (private.is_round_owner(id));

create policy "Round owners can manage invitations"
on public.reading_invitations for all to authenticated
using (private.is_round_owner(reading_round_id)) with check (private.is_round_owner(reading_round_id));
create policy "Round owners can manage access links"
on public.reading_round_access_links for all to authenticated
using (private.is_round_owner(reading_round_id)) with check (private.is_round_owner(reading_round_id));

create policy "Round owners and assigned readers can read assignments"
on public.reader_assignments for select to authenticated
using (private.is_round_owner(reading_round_id) or private.is_assignment_owner(id));
create policy "Round owners can create reader assignments"
on public.reader_assignments for insert to authenticated with check (private.is_round_owner(reading_round_id));
create policy "Round owners can update reader assignments"
on public.reader_assignments for update to authenticated
using (private.is_round_owner(reading_round_id)) with check (private.is_round_owner(reading_round_id));
create policy "Round owners can delete reader assignments"
on public.reader_assignments for delete to authenticated using (private.is_round_owner(reading_round_id));

create policy "Round owners and readers can read chapter progress"
on public.chapter_reading_progress for select to authenticated
using (
  private.is_assignment_owner(reader_assignment_id) or exists (
    select 1 from public.reader_assignments reader_assignment
    where reader_assignment.id = chapter_reading_progress.reader_assignment_id
      and private.is_round_owner(reader_assignment.reading_round_id)
  )
);
create policy "Readers can create chapter progress"
on public.chapter_reading_progress for insert to authenticated
with check (private.is_assignment_owner(reader_assignment_id) and private.can_assignment_access_chapter(reader_assignment_id, chapter_id));
create policy "Readers can update chapter progress"
on public.chapter_reading_progress for update to authenticated
using (private.is_assignment_owner(reader_assignment_id))
with check (private.is_assignment_owner(reader_assignment_id) and private.can_assignment_access_chapter(reader_assignment_id, chapter_id));
create policy "Readers can delete chapter progress"
on public.chapter_reading_progress for delete to authenticated using (private.is_assignment_owner(reader_assignment_id));

create policy "Authenticated users can read annotation tags"
on public.annotation_tags for select to authenticated using (true);
create policy "Chapter owners and readers can read annotations"
on public.annotations for select to authenticated
using (private.is_chapter_owner(chapter_id) or private.is_assignment_owner(reader_assignment_id));
create policy "Chapter owners can update annotations"
on public.annotations for update to authenticated
using (private.is_chapter_owner(chapter_id)) with check (private.is_chapter_owner(chapter_id));
create policy "Chapter owners can delete annotations"
on public.annotations for delete to authenticated using (private.is_chapter_owner(chapter_id));
create policy "Readers can create annotations for their accessible chapters"
on public.annotations for insert to authenticated
with check (
  private.is_assignment_owner(reader_assignment_id)
  and private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
  and exists (
    select 1 from public.chapter_blocks chapter_block
    where chapter_block.id = chapter_block_id and chapter_block.chapter_id = chapter_id
  )
);

create policy "Survey owners and readers can read surveys"
on public.surveys for select to authenticated
using (private.is_round_owner(reading_round_id) or private.can_read_survey(id));
create policy "Round owners can create surveys"
on public.surveys for insert to authenticated with check (private.is_round_owner(reading_round_id));
create policy "Survey owners can update surveys"
on public.surveys for update to authenticated
using (private.is_survey_owner(id)) with check (private.is_round_owner(reading_round_id));
create policy "Survey owners can delete surveys"
on public.surveys for delete to authenticated using (private.is_survey_owner(id));

create policy "Survey owners and readers can read survey questions"
on public.survey_questions for select to authenticated
using (private.is_survey_owner(survey_id) or private.can_read_survey_question(id));
create policy "Survey owners can insert survey questions"
on public.survey_questions for insert to authenticated with check (private.is_survey_owner(survey_id));
create policy "Survey owners can update survey questions"
on public.survey_questions for update to authenticated
using (private.is_survey_question_owner(id)) with check (private.is_survey_owner(survey_id));
create policy "Survey owners can delete survey questions"
on public.survey_questions for delete to authenticated using (private.is_survey_question_owner(id));

create policy "Survey owners and readers can read survey options"
on public.survey_question_options for select to authenticated
using (
  private.is_survey_question_owner(survey_question_id)
  or private.can_read_survey_question(survey_question_id)
);
create policy "Survey owners can insert survey options"
on public.survey_question_options for insert to authenticated with check (private.is_survey_question_owner(survey_question_id));
create policy "Survey owners can update survey options"
on public.survey_question_options for update to authenticated
using (private.is_survey_question_owner(survey_question_id)) with check (private.is_survey_question_owner(survey_question_id));
create policy "Survey owners can delete survey options"
on public.survey_question_options for delete to authenticated using (private.is_survey_question_owner(survey_question_id));

create policy "Survey owners and readers can read submissions"
on public.survey_submissions for select to authenticated
using (
  private.is_survey_owner(survey_id)
  or private.can_assignment_answer_survey(reader_assignment_id, survey_id)
);
create policy "Readers can create survey submissions"
on public.survey_submissions for insert to authenticated
with check (private.can_assignment_answer_survey(reader_assignment_id, survey_id));
create policy "Readers can update survey submissions"
on public.survey_submissions for update to authenticated
using (private.is_submission_owner(id)) with check (private.can_assignment_answer_survey(reader_assignment_id, survey_id));
create policy "Readers can delete survey submissions"
on public.survey_submissions for delete to authenticated using (private.is_submission_owner(id));

create policy "Survey owners and readers can read answers"
on public.survey_answers for select to authenticated using (private.can_read_survey_submission(survey_submission_id));
create policy "Readers can create survey answers"
on public.survey_answers for insert to authenticated with check (private.is_submission_owner(survey_submission_id));
create policy "Readers can update survey answers"
on public.survey_answers for update to authenticated
using (private.is_submission_owner(survey_submission_id)) with check (private.is_submission_owner(survey_submission_id));
create policy "Readers can delete survey answers"
on public.survey_answers for delete to authenticated using (private.is_submission_owner(survey_submission_id));
