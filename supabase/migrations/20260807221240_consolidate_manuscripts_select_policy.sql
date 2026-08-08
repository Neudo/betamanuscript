drop policy "Manuscript owners can select their manuscripts" on public.manuscripts;
drop policy "Readers can select accessible manuscripts" on public.manuscripts;

create policy "Authors and readers can select accessible manuscripts"
on public.manuscripts
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
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
