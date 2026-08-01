-- Store a private avatar path for each account. Reader-facing display can use
-- a narrowly scoped signed URL once that surface is implemented.
alter table public.profiles
  add column if not exists avatar_path text;

alter table public.profiles
  drop constraint if exists profiles_avatar_path_format;

alter table public.profiles
  add constraint profiles_avatar_path_format
  check (
    avatar_path is null
    or (
      avatar_path like (id::text || '/avatar-%')
      and avatar_path ~ '\.(jpg|png|webp)$'
      and char_length(avatar_path) <= 512
    )
  );

grant update (avatar_path)
on table public.profiles
to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their profile avatars" on storage.objects;
create policy "Users can upload their profile avatars"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-avatars'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) ~ '^avatar-[0-9a-f-]+\.(jpg|png|webp)$'
);

drop policy if exists "Users can read their profile avatars" on storage.objects;
create policy "Users can read their profile avatars"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-avatars'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) ~ '^avatar-[0-9a-f-]+\.(jpg|png|webp)$'
);

drop policy if exists "Users can delete their profile avatars" on storage.objects;
create policy "Users can delete their profile avatars"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-avatars'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and storage.filename(name) ~ '^avatar-[0-9a-f-]+\.(jpg|png|webp)$'
);
