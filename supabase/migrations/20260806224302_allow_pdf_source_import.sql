update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain'
]::text[]
where id = 'manuscript-sources';

drop policy if exists "Authors can upload their manuscript sources" on storage.objects;
create policy "Authors can upload their manuscript sources"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'manuscript-sources'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) in ('source.docx', 'source.md', 'source.pdf', 'source.txt')
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
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
  and storage.filename(name) in ('source.docx', 'source.md', 'source.pdf', 'source.txt')
  and exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.manuscripts manuscript on manuscript.id = manuscript_version.manuscript_id
    where manuscript_version.id::text = (storage.foldername(name))[2]
      and manuscript.owner_id = (select auth.uid())
  )
);
