-- Reader assignments only make sense while their reader profile exists.
-- Pending invitations intentionally have a null profile and are preserved.
delete from public.reader_assignments
where reader_profile_id is null
  and status in ('started', 'completed', 'revoked');

alter table public.reader_assignments
  drop constraint reader_assignments_reader_profile_id_fkey,
  add constraint reader_assignments_reader_profile_id_fkey
    foreign key (reader_profile_id)
    references public.profiles(id)
    on delete cascade;
