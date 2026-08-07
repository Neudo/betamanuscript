-- Covers are optimized in the browser before upload. Keep Storage aligned with
-- that contract so original multi-megabyte images cannot consume the bucket.

update storage.buckets
set
  file_size_limit = 1048576,
  allowed_mime_types = array['image/webp']::text[]
where id = 'manuscript-covers';

drop policy if exists "Authors can upload their manuscript covers" on storage.objects;
create policy "Authors can upload their manuscript covers"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'manuscript-covers'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) = 'cover.webp'
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
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
  and storage.filename(name) = 'cover.webp'
  and exists (
    select 1
    from public.manuscripts manuscript
    join public.manuscript_versions manuscript_version on manuscript_version.manuscript_id = manuscript.id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);
