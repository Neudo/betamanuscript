-- Creates the initial manuscript aggregate in one transaction.
-- SECURITY INVOKER deliberately preserves the caller's RLS policies.

create or replace function public.create_manuscript_from_draft(p_draft jsonb)
returns table (
  manuscript_id uuid,
  manuscript_version_id uuid,
  reading_round_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  created_manuscript_id uuid;
  created_version_id uuid;
  created_round_id uuid;
  title text := nullif(btrim(p_draft ->> 'title'), '');
  logline text := nullif(btrim(p_draft ->> 'logline'), '');
  reader_note text := nullif(btrim(p_draft ->> 'reader_note'), '');
  version_number integer := coalesce((p_draft ->> 'draft_number')::integer, 1);
  chapter_count integer := coalesce((p_draft ->> 'chapter_count')::integer, 1);
  max_readers integer := coalesce((p_draft ->> 'max_readers')::integer, 5);
  reading_deadline date := nullif(p_draft ->> 'reading_deadline', '')::date;
  word_count_band public.word_count_band;
  access_mode public.reading_access_mode;
  genre_slugs text[];
begin
  if current_profile_id is null then
    raise exception 'Authentication is required to create a manuscript.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_draft) <> 'object' then
    raise exception 'The manuscript draft must be a JSON object.' using errcode = '22023';
  end if;

  if title is null or char_length(title) > 300 then
    raise exception 'The title must contain between 1 and 300 characters.' using errcode = '22023';
  end if;

  if logline is not null and char_length(logline) > 2000 then
    raise exception 'The logline cannot exceed 2000 characters.' using errcode = '22023';
  end if;

  if reader_note is not null and char_length(reader_note) > 4000 then
    raise exception 'The reader note cannot exceed 4000 characters.' using errcode = '22023';
  end if;

  if version_number < 1 then
    raise exception 'The draft number must be greater than zero.' using errcode = '22023';
  end if;

  if chapter_count < 1 or chapter_count > 200 then
    raise exception 'The chapter count must be between 1 and 200.' using errcode = '22023';
  end if;

  if max_readers < 1 then
    raise exception 'The reader limit must be greater than zero.' using errcode = '22023';
  end if;

  if p_draft ? 'word_count_band' and nullif(p_draft ->> 'word_count_band', '') is not null then
    word_count_band := (p_draft ->> 'word_count_band')::public.word_count_band;
  end if;

  if p_draft ->> 'access_mode' = 'open_signup' then
    access_mode := 'open_signup'::public.reading_access_mode;
  elsif p_draft ->> 'access_mode' = 'invite_only' then
    access_mode := 'invite_only'::public.reading_access_mode;
  else
    raise exception 'The access mode is invalid.' using errcode = '22023';
  end if;

  select coalesce(array_agg(value order by ordinality), array[]::text[])
  into genre_slugs
  from jsonb_array_elements_text(coalesce(p_draft -> 'genre_slugs', '[]'::jsonb)) with ordinality;

  if cardinality(genre_slugs) <> cardinality(array(select distinct unnest(genre_slugs))) then
    raise exception 'A genre can only be selected once.' using errcode = '22023';
  end if;

  if (
    select count(*)
    from public.genres
    where is_active and slug = any (genre_slugs)
  ) <> cardinality(genre_slugs) then
    raise exception 'One or more selected genres are invalid.' using errcode = '22023';
  end if;

  insert into public.manuscripts (owner_id, internal_title)
  values (current_profile_id, title)
  returning id into created_manuscript_id;

  insert into public.manuscript_versions (
    manuscript_id,
    version_number,
    title,
    logline,
    estimated_word_count_band,
    created_by
  )
  values (
    created_manuscript_id,
    version_number,
    title,
    logline,
    word_count_band,
    current_profile_id
  )
  returning id into created_version_id;

  insert into public.manuscript_version_genres (
    manuscript_version_id,
    genre_slug,
    sort_order
  )
  select created_version_id, genre_slug, position::smallint
  from unnest(genre_slugs) with ordinality as selected(genre_slug, position);

  insert into public.manuscript_chapters (
    manuscript_version_id,
    position,
    title
  )
  select created_version_id, position, 'Chapter ' || position
  from generate_series(1, chapter_count) as position;

  insert into public.reading_rounds (
    manuscript_version_id,
    access_mode,
    max_readers,
    reading_deadline,
    reader_note
  )
  values (
    created_version_id,
    access_mode,
    max_readers,
    reading_deadline,
    reader_note
  )
  returning id into created_round_id;

  return query
  select created_manuscript_id, created_version_id, created_round_id;
end;
$$;

revoke execute on function public.create_manuscript_from_draft(jsonb) from public, anon;
grant execute on function public.create_manuscript_from_draft(jsonb) to authenticated;
