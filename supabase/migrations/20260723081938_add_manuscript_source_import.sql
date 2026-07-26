-- Imports detected chapters and paragraph blocks in the same transaction as the manuscript.
-- File bytes are uploaded separately to the private Storage bucket after this transaction commits.

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
  created_chapter_id uuid;
  title text := nullif(btrim(p_draft ->> 'title'), '');
  logline text := nullif(btrim(p_draft ->> 'logline'), '');
  reader_note text := nullif(btrim(p_draft ->> 'reader_note'), '');
  version_number integer := coalesce((p_draft ->> 'draft_number')::integer, 1);
  chapter_count integer := coalesce((p_draft ->> 'chapter_count')::integer, 1);
  max_readers integer := coalesce((p_draft ->> 'max_readers')::integer, 5);
  reading_deadline date := nullif(p_draft ->> 'reading_deadline', '')::date;
  imported_chapters jsonb := p_draft -> 'chapters';
  imported_chapter jsonb;
  imported_blocks jsonb;
  imported_block jsonb;
  imported_block_count integer := 0;
  imported_character_count integer := 0;
  chapter_position integer;
  block_position integer;
  chapter_title text;
  block_content text;
  block_kind public.chapter_block_kind;
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

  if imported_chapters is not null then
    if jsonb_typeof(imported_chapters) <> 'array' then
      raise exception 'Imported chapters must be an array.' using errcode = '22023';
    end if;

    chapter_count := jsonb_array_length(imported_chapters);
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

  if imported_chapters is null then
    insert into public.manuscript_chapters (
      manuscript_version_id,
      position,
      title
    )
    select created_version_id, position, 'Chapter ' || position
    from generate_series(1, chapter_count) as position;
  else
    for chapter_position in 0..chapter_count - 1 loop
      imported_chapter := imported_chapters -> chapter_position;
      if jsonb_typeof(imported_chapter) <> 'object' then
        raise exception 'Each imported chapter must be an object.' using errcode = '22023';
      end if;

      chapter_title := nullif(btrim(imported_chapter ->> 'title'), '');
      if chapter_title is null or char_length(chapter_title) > 500 then
        raise exception 'Each imported chapter title must contain between 1 and 500 characters.' using errcode = '22023';
      end if;

      imported_blocks := coalesce(imported_chapter -> 'blocks', '[]'::jsonb);
      if jsonb_typeof(imported_blocks) <> 'array' then
        raise exception 'Each imported chapter blocks field must be an array.' using errcode = '22023';
      end if;

      insert into public.manuscript_chapters (
        manuscript_version_id,
        position,
        title
      )
      values (
        created_version_id,
        chapter_position + 1,
        chapter_title
      )
      returning id into created_chapter_id;

      block_position := 1;
      for imported_block in select value from jsonb_array_elements(imported_blocks) loop
        imported_block_count := imported_block_count + 1;
        if imported_block_count > 5000 then
          raise exception 'An imported manuscript cannot contain more than 5,000 blocks.' using errcode = '22023';
        end if;

        if jsonb_typeof(imported_block) <> 'object' then
          raise exception 'Each imported block must be an object.' using errcode = '22023';
        end if;

        block_content := nullif(btrim(imported_block ->> 'content'), '');
        if block_content is null or char_length(block_content) > 25000 then
          raise exception 'Each imported block must contain between 1 and 25,000 characters.' using errcode = '22023';
        end if;

        imported_character_count := imported_character_count + char_length(block_content);
        if imported_character_count > 1000000 then
          raise exception 'An imported manuscript cannot exceed 1,000,000 characters.' using errcode = '22023';
        end if;

        if imported_block ->> 'kind' = 'paragraph' then
          block_kind := 'paragraph'::public.chapter_block_kind;
        else
          raise exception 'Imported blocks must use the paragraph kind.' using errcode = '22023';
        end if;

        insert into public.chapter_blocks (
          chapter_id,
          position,
          kind,
          content
        )
        values (
          created_chapter_id,
          block_position,
          block_kind,
          block_content
        );

        block_position := block_position + 1;
      end loop;
    end loop;
  end if;

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

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'manuscript-sources',
  'manuscript-sources',
  false,
  20971520,
  array[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/plain'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create unique index if not exists manuscript_assets_one_source_per_version_idx
on public.manuscript_assets (manuscript_version_id)
where asset_kind = 'source_document';

drop policy if exists "Authors can upload their manuscript sources" on storage.objects;
create policy "Authors can upload their manuscript sources"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'manuscript-sources'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) in ('source.docx', 'source.md', 'source.txt')
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);

drop policy if exists "Authors can read their manuscript sources" on storage.objects;
create policy "Authors can read their manuscript sources"
on storage.objects for select to authenticated
using (
  bucket_id = 'manuscript-sources'
  and exists (
    select 1
    from public.manuscript_assets manuscript_asset
    where manuscript_asset.storage_bucket = 'manuscript-sources'
      and manuscript_asset.storage_path = name
      and manuscript_asset.asset_kind = 'source_document'
      and private.is_manuscript_version_owner(manuscript_asset.manuscript_version_id)
  )
);

drop policy if exists "Authors can replace their manuscript sources" on storage.objects;
create policy "Authors can replace their manuscript sources"
on storage.objects for update to authenticated
using (
  bucket_id = 'manuscript-sources'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'manuscript-sources'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) in ('source.docx', 'source.md', 'source.txt')
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);

drop policy if exists "Authors can delete their manuscript sources" on storage.objects;
create policy "Authors can delete their manuscript sources"
on storage.objects for delete to authenticated
using (
  bucket_id = 'manuscript-sources'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);
