-- Completion timestamps must come from Postgres, not the reader's device.
-- Otherwise a clock that lags behind the database can make completed_at older
-- than the server-generated started_at and violate the table constraint.
create or replace function public.complete_reader_chapter(
  p_chapter_id uuid,
  p_reader_assignment_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.chapter_reading_progress (
    chapter_id,
    completed_at,
    last_read_at,
    reader_assignment_id,
    status
  )
  values (
    p_chapter_id,
    now(),
    now(),
    p_reader_assignment_id,
    'completed'
  )
  on conflict (reader_assignment_id, chapter_id) do update
  set
    completed_at = greatest(now(), public.chapter_reading_progress.started_at),
    last_read_at = now(),
    status = 'completed';
end;
$$;

revoke all on function public.complete_reader_chapter(uuid, uuid)
from public, anon;
grant execute on function public.complete_reader_chapter(uuid, uuid)
to authenticated;
