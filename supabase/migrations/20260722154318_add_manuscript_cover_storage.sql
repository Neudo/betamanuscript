-- Stores one private cover image per manuscript version.
-- The file itself stays in Storage; manuscript_assets only stores its metadata and path.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'manuscript-covers',
  'manuscript-covers',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create unique index if not exists manuscript_assets_one_cover_per_version_idx
on public.manuscript_assets (manuscript_version_id)
where asset_kind = 'cover';

drop policy if exists "Authors can upload their manuscript covers" on storage.objects;
create policy "Authors can upload their manuscript covers"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'manuscript-covers'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) in ('cover.jpg', 'cover.png', 'cover.webp')
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);

drop policy if exists "Authors can read permitted manuscript covers" on storage.objects;
create policy "Authors can read permitted manuscript covers"
on storage.objects for select to authenticated
using (
  bucket_id = 'manuscript-covers'
  and exists (
    select 1
    from public.manuscript_assets manuscript_asset
    where manuscript_asset.storage_bucket = 'manuscript-covers'
      and manuscript_asset.storage_path = name
      and manuscript_asset.asset_kind = 'cover'
      and private.can_read_manuscript_version(manuscript_asset.manuscript_version_id)
  )
);

drop policy if exists "Authors can replace their manuscript covers" on storage.objects;
create policy "Authors can replace their manuscript covers"
on storage.objects for update to authenticated
using (
  bucket_id = 'manuscript-covers'
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
  bucket_id = 'manuscript-covers'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) in ('cover.jpg', 'cover.png', 'cover.webp')
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);

drop policy if exists "Authors can delete their manuscript covers" on storage.objects;
create policy "Authors can delete their manuscript covers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'manuscript-covers'
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
