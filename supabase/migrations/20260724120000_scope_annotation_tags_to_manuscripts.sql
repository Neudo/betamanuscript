-- Tags are feedback vocabulary owned by a manuscript, not global mutable data.
-- This lets authors adapt tags without changing another author's reader workflow.
create table public.manuscript_annotation_tags (
  id uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  label text not null check (char_length(trim(label)) between 1 and 80),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order smallint not null check (sort_order > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manuscript_id, slug),
  unique (manuscript_id, sort_order)
);

create index manuscript_annotation_tags_manuscript_active_idx
on public.manuscript_annotation_tags (manuscript_id, is_active, sort_order);

-- Copy the initial vocabulary to every existing manuscript before moving feedback
-- to the manuscript-specific foreign key.
insert into public.manuscript_annotation_tags (
  manuscript_id,
  slug,
  label,
  color,
  sort_order,
  is_active
)
select
  manuscript.id,
  tag.slug,
  tag.label,
  tag.color,
  tag.sort_order,
  tag.is_active
from public.manuscripts manuscript
cross join public.annotation_tags tag;

alter table public.annotations
add column tag_id uuid references public.manuscript_annotation_tags(id) on delete restrict;

update public.annotations annotation
set tag_id = tag.id
from public.manuscript_chapters chapter
join public.manuscript_versions version on version.id = chapter.manuscript_version_id
join public.manuscript_annotation_tags tag
  on tag.manuscript_id = version.manuscript_id
where chapter.id = annotation.chapter_id
  and tag.slug = annotation.tag_slug;

do $$
begin
  if exists (select 1 from public.annotations where tag_id is null) then
    raise exception 'Every annotation must be assigned to a manuscript tag before migration.';
  end if;
end;
$$;

alter table public.annotations
alter column tag_id set not null;

alter table public.annotations
drop constraint annotations_tag_slug_fkey;

drop index if exists public.annotations_chapter_tag_created_idx;
drop index if exists public.annotations_tag_idx;

alter table public.annotations
drop column tag_slug;

create index annotations_chapter_tag_created_idx
on public.annotations (chapter_id, tag_id, created_at desc);

create index annotations_tag_idx
on public.annotations (tag_id);

create or replace function private.seed_manuscript_annotation_tags()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.manuscript_annotation_tags (
    manuscript_id,
    slug,
    label,
    color,
    sort_order,
    is_active
  )
  select
    new.id,
    tag.slug,
    tag.label,
    tag.color,
    tag.sort_order,
    tag.is_active
  from public.annotation_tags tag;

  return new;
end;
$$;

revoke all on function private.seed_manuscript_annotation_tags()
from public, anon, authenticated;

create trigger manuscripts_seed_annotation_tags
after insert on public.manuscripts
for each row execute procedure private.seed_manuscript_annotation_tags();

create trigger manuscript_annotation_tags_set_updated_at
before update on public.manuscript_annotation_tags
for each row execute procedure private.set_updated_at();

create or replace function private.is_active_manuscript_tag_for_chapter(
  p_tag_id uuid,
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
    from public.manuscript_annotation_tags tag
    join public.manuscript_chapters chapter on chapter.id = p_chapter_id
    join public.manuscript_versions version on version.id = chapter.manuscript_version_id
    where tag.id = p_tag_id
      and tag.manuscript_id = version.manuscript_id
      and tag.is_active
  );
$$;

revoke all on function private.is_active_manuscript_tag_for_chapter(uuid, uuid)
from public, anon, authenticated;

create or replace function private.prevent_reader_annotation_anchor_changes()
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
      or new.chapter_block_id is distinct from old.chapter_block_id
      or new.quote is distinct from old.quote
      or new.selection_start is distinct from old.selection_start
      or new.selection_end is distinct from old.selection_end
      or new.context_before is distinct from old.context_before
      or new.context_after is distinct from old.context_after
      or new.author_seen_at is distinct from old.author_seen_at
      or new.author_resolved_at is distinct from old.author_resolved_at
    )
  then
    raise exception 'Readers can only update an annotation tag or comment.';
  end if;

  if private.is_assignment_owner(old.reader_assignment_id)
    and new.tag_id is distinct from old.tag_id
    and not private.is_active_manuscript_tag_for_chapter(new.tag_id, new.chapter_id)
  then
    raise exception 'Choose an active tag for this manuscript.';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_reader_annotation_anchor_changes()
from public, anon, authenticated;

drop policy if exists "Readers can create annotations for their accessible chapters" on public.annotations;
create policy "Readers can create annotations for their accessible chapters"
on public.annotations for insert to authenticated
with check (
  private.is_assignment_owner(reader_assignment_id)
  and private.can_assignment_access_chapter(reader_assignment_id, chapter_id)
  and private.is_active_manuscript_tag_for_chapter(tag_id, chapter_id)
  and exists (
    select 1
    from public.chapter_blocks chapter_block
    where chapter_block.id = chapter_block_id and chapter_block.chapter_id = chapter_id
  )
);

alter table public.manuscript_annotation_tags enable row level security;

revoke all on table public.manuscript_annotation_tags
from anon, authenticated;

grant select, insert, update on table public.manuscript_annotation_tags
to authenticated;

create policy "Authors and assigned readers can read manuscript annotation tags"
on public.manuscript_annotation_tags for select to authenticated
using (
  private.is_manuscript_owner(manuscript_id)
  or exists (
    select 1
    from public.manuscript_versions version
    where version.manuscript_id = manuscript_annotation_tags.manuscript_id
      and private.can_read_manuscript_version(version.id)
  )
);

create policy "Manuscript owners can create annotation tags"
on public.manuscript_annotation_tags for insert to authenticated
with check (private.is_manuscript_owner(manuscript_id));

create policy "Manuscript owners can update annotation tags"
on public.manuscript_annotation_tags for update to authenticated
using (private.is_manuscript_owner(manuscript_id))
with check (private.is_manuscript_owner(manuscript_id));
