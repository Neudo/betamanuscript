alter table public.manuscripts
  add column url_key text default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

update public.manuscripts
set url_key = substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
where url_key is null;

alter table public.manuscripts
  alter column url_key set not null,
  add constraint manuscripts_url_key_format check (url_key ~ '^[a-f0-9]{12}$'),
  add constraint manuscripts_url_key_key unique (url_key);

create policy "Readers can select accessible manuscripts"
on public.manuscripts
for select
to authenticated
using (
  exists (
    select 1
    from public.manuscript_versions manuscript_version
    join public.reading_rounds reading_round
      on reading_round.manuscript_version_id = manuscript_version.id
    join public.reader_assignments reader_assignment
      on reader_assignment.reading_round_id = reading_round.id
    join public.reader_draft_access reader_draft_access
      on reader_draft_access.reader_assignment_id = reader_assignment.id
    where manuscript_version.manuscript_id = manuscripts.id
      and reader_assignment.reader_profile_id = (select auth.uid())
  )
);
