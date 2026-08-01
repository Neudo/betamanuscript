-- A general chapter comment is deliberately separate from a passage annotation:
-- it has no fabricated quote or tag, and one reader can maintain one overview
-- comment per chapter.
create table public.chapter_general_comments (
  id uuid primary key default gen_random_uuid(),
  reader_assignment_id uuid not null
    references public.reader_assignments(id) on delete cascade,
  chapter_id uuid not null
    references public.manuscript_chapters(id) on delete cascade,
  comment text not null
    check (char_length(trim(comment)) between 1 and 4000),
  author_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reader_assignment_id, chapter_id)
);

create index chapter_general_comments_chapter_created_idx
  on public.chapter_general_comments (chapter_id, created_at desc);

alter table public.chapter_general_comments enable row level security;

revoke all on table public.chapter_general_comments from public, anon, authenticated;
grant select, insert, update, delete on table public.chapter_general_comments to authenticated;

create policy "Chapter owners and readers can read general comments"
on public.chapter_general_comments
for select
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

create policy "Readers can create general comments for accessible chapters"
on public.chapter_general_comments
for insert
to authenticated
with check (
  private.is_assignment_owner(reader_assignment_id)
  and private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

create policy "Chapter owners and readers can update general comments"
on public.chapter_general_comments
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

create policy "Chapter owners and readers can delete general comments"
on public.chapter_general_comments
for delete
to authenticated
using (
  private.is_chapter_owner(chapter_id)
  or private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
);

create or replace function private.prevent_reader_general_comment_scope_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_assignment_owner(old.reader_assignment_id)
    and (
      new.reader_assignment_id is distinct from old.reader_assignment_id
      or new.chapter_id is distinct from old.chapter_id
      or new.author_seen_at is distinct from old.author_seen_at
    )
  then
    raise exception 'Readers can only update their general comment.';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_reader_general_comment_scope_changes()
from public, anon, authenticated;

create trigger chapter_general_comments_prevent_reader_scope_changes
before update on public.chapter_general_comments
for each row execute procedure private.prevent_reader_general_comment_scope_changes();

create trigger chapter_general_comments_set_updated_at
before update on public.chapter_general_comments
for each row execute procedure private.set_updated_at();

create or replace function private.notify_author_on_chapter_general_comment()
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
  target_chapter_position integer;
begin
  select
    manuscript.owner_id,
    manuscript.id,
    manuscript_version.id,
    manuscript_version.title,
    chapter.position
  into
    target_profile_id,
    target_manuscript_id,
    target_version_id,
    target_title,
    target_chapter_position
  from public.manuscript_chapters chapter
  join public.manuscript_versions manuscript_version
    on manuscript_version.id = chapter.manuscript_version_id
  join public.manuscripts manuscript
    on manuscript.id = manuscript_version.manuscript_id
  where chapter.id = new.chapter_id;

  if target_profile_id is not null then
    perform private.create_author_notification(
      target_profile_id,
      'chapter-general-comment:' || new.id::text,
      'new_annotation',
      'New chapter feedback',
      'A reader left a general comment on Chapter ' || target_chapter_position::text
        || ' of “' || target_title || '”.',
      '/dashboard/feedback?manuscriptId=' || target_manuscript_id::text
        || '&versionId=' || target_version_id::text
    );
  end if;

  return new;
end;
$$;

create trigger chapter_general_comments_notify_author
after insert on public.chapter_general_comments
for each row execute procedure private.notify_author_on_chapter_general_comment();

revoke all on function private.notify_author_on_chapter_general_comment()
from public, anon, authenticated;
