-- Keep the same author-or-reader access rule in one SELECT policy so Postgres
-- does not evaluate two permissive policies for every chapter-access query.

drop policy if exists "Authors can view reader chapter access" on public.reader_assignment_chapter_access;
drop policy if exists "Readers can view their chapter access" on public.reader_assignment_chapter_access;

create policy "Authors and readers can view chapter access"
on public.reader_assignment_chapter_access
for select
to authenticated
using (
  private.is_assignment_owner(reader_assignment_id)
  or exists (
    select 1
    from public.reader_assignments reader_assignment
    where reader_assignment.id = reader_assignment_chapter_access.reader_assignment_id
      and private.is_round_owner(reader_assignment.reading_round_id)
  )
);
