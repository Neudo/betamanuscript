-- Keep the editable settings in parity with the create-manuscript wizard while
-- preserving the immutable snapshot rule for drafts already shared with readers.

drop function if exists public.update_manuscript_settings(uuid, uuid, text, text, text);

create function public.update_manuscript_settings(
  p_manuscript_id uuid,
  p_manuscript_version_id uuid,
  p_title text,
  p_logline text,
  p_estimated_word_count_band public.word_count_band,
  p_genre_slugs text[],
  p_reading_deadline date,
  p_max_readers integer,
  p_reader_note text,
  p_reader_closing_note text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  normalized_title text := nullif(btrim(p_title), '');
  normalized_logline text := nullif(btrim(p_logline), '');
  normalized_reader_note text := nullif(btrim(p_reader_note), '');
  normalized_closing_note text := nullif(btrim(p_reader_closing_note), '');
  normalized_genre_slugs text[];
  current_genre_slugs text[];
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to update a manuscript.' using errcode = '42501';
  end if;

  if normalized_title is null or char_length(normalized_title) > 300 then
    raise exception 'The title must contain between 1 and 300 characters.' using errcode = '22023';
  end if;

  if normalized_logline is not null and char_length(normalized_logline) > 2000 then
    raise exception 'The logline cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  if normalized_reader_note is not null and char_length(normalized_reader_note) > 4000 then
    raise exception 'The reader note cannot exceed 4000 characters.' using errcode = '22023';
  end if;

  if normalized_closing_note is not null and char_length(normalized_closing_note) > 4000 then
    raise exception 'The closing note cannot exceed 4000 characters.' using errcode = '22023';
  end if;

  if p_max_readers is null or p_max_readers < 1 then
    raise exception 'The reader limit must be greater than zero.' using errcode = '22023';
  end if;

  select coalesce(array_agg(btrim(selected.genre_slug) order by selected.ordinality), array[]::text[])
  into normalized_genre_slugs
  from unnest(coalesce(p_genre_slugs, array[]::text[])) with ordinality as selected(genre_slug, ordinality);

  if exists (
    select 1
    from unnest(normalized_genre_slugs) as selected(genre_slug)
    where genre_slug is null or genre_slug = ''
  ) then
    raise exception 'One or more selected genres are invalid.' using errcode = '22023';
  end if;

  if cardinality(normalized_genre_slugs) <> cardinality(array(select distinct unnest(normalized_genre_slugs))) then
    raise exception 'A genre can only be selected once.' using errcode = '22023';
  end if;

  if (
    select count(*)
    from public.genres genre
    where genre.is_active and genre.slug = any (normalized_genre_slugs)
  ) <> cardinality(normalized_genre_slugs) then
    raise exception 'One or more selected genres are invalid.' using errcode = '22023';
  end if;

  perform 1
  from public.manuscript_versions manuscript_version
  join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
  where manuscript_version.id = p_manuscript_version_id
    and manuscript_version.manuscript_id = p_manuscript_id
    and manuscript_version.archived_at is null
    and manuscript.archived_at is null
    and manuscript.owner_id = current_profile_id
  for update of manuscript_version, manuscript;

  if not found then
    raise exception 'This manuscript version could not be found.' using errcode = 'P0002';
  end if;

  select coalesce(array_agg(version_genre.genre_slug order by version_genre.sort_order), array[]::text[])
  into current_genre_slugs
  from public.manuscript_version_genres version_genre
  where version_genre.manuscript_version_id = p_manuscript_version_id;

  update public.manuscripts manuscript
  set internal_title = normalized_title
  where manuscript.id = p_manuscript_id;

  update public.manuscript_versions manuscript_version
  set
    title = normalized_title,
    logline = normalized_logline,
    estimated_word_count_band = p_estimated_word_count_band
  where manuscript_version.id = p_manuscript_version_id;

  if current_genre_slugs is distinct from normalized_genre_slugs then
    delete from public.manuscript_version_genres version_genre
    where version_genre.manuscript_version_id = p_manuscript_version_id;

    insert into public.manuscript_version_genres (
      manuscript_version_id,
      genre_slug,
      sort_order
    )
    select p_manuscript_version_id, selected.genre_slug, selected.ordinality::smallint
    from unnest(normalized_genre_slugs) with ordinality as selected(genre_slug, ordinality);
  end if;

  update public.reading_rounds reading_round
  set
    max_readers = p_max_readers,
    reading_deadline = p_reading_deadline,
    reader_note = normalized_reader_note,
    reader_closing_note = normalized_closing_note
  where reading_round.id = (
    select current_round.id
    from public.reading_rounds current_round
    where current_round.manuscript_version_id = p_manuscript_version_id
      and current_round.status <> 'archived'
    order by current_round.created_at desc
    limit 1
  );

  if not found then
    raise exception 'This manuscript version has no active reading round.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_manuscript_settings(uuid, uuid, text, text, public.word_count_band, text[], date, integer, text, text) from public, anon;
grant execute on function public.update_manuscript_settings(uuid, uuid, text, text, public.word_count_band, text[], date, integer, text, text) to authenticated;

create or replace function private.prevent_shared_version_genre_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_version_id uuid := coalesce(new.manuscript_version_id, old.manuscript_version_id);
begin
  if exists (
    select 1
    from public.reading_rounds reading_round
    where reading_round.manuscript_version_id = target_version_id
      and reading_round.status in ('open', 'closed')
  ) then
    raise exception 'Create a new manuscript version instead of changing a version that has been shared with readers.';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function private.prevent_shared_version_genre_changes() from public, anon, authenticated;

drop trigger if exists prevent_shared_version_genre_changes on public.manuscript_version_genres;
create trigger prevent_shared_version_genre_changes
before insert or update or delete on public.manuscript_version_genres
for each row execute function private.prevent_shared_version_genre_changes();
