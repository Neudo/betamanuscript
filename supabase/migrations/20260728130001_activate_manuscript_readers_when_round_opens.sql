-- Reader assignments copied from another draft remain pending while a new
-- version is editable. Opening that version activates every already accepted
-- reader in one transaction, so its feedback round has the same readership.

create or replace function private.activate_manuscript_reader_assignments_for_round()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'draft' and new.status = 'open' then
    update public.reader_assignments
    set
      status = 'started',
      started_at = coalesce(started_at, now()),
      last_active_at = coalesce(last_active_at, now())
    where reading_round_id = new.id
      and reader_profile_id is not null
      and status = 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists reading_rounds_activate_manuscript_readers on public.reading_rounds;
create trigger reading_rounds_activate_manuscript_readers
after update of status on public.reading_rounds
for each row
when (old.status is distinct from new.status)
execute procedure private.activate_manuscript_reader_assignments_for_round();
