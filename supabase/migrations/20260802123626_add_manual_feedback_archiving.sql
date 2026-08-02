-- Authors can manually move an active feedback item out of their working list.
-- The historical record remains available in the Feedback explorer until it is
-- explicitly and permanently deleted by the manuscript owner.

alter table public.annotations
  drop constraint if exists annotations_archived_reason_check,
  add constraint annotations_archived_reason_check
    check (archived_reason is null or archived_reason in (
      'text_changed',
      'chapter_replaced',
      'chapter_deleted',
      'manually_archived'
    ));

alter table public.chapter_general_comments
  drop constraint if exists chapter_general_comments_archived_reason_check,
  add constraint chapter_general_comments_archived_reason_check
    check (archived_reason is null or archived_reason in (
      'chapter_replaced',
      'chapter_deleted',
      'manually_archived'
    ));

create or replace function public.archive_feedback(
  p_feedback_id uuid,
  p_feedback_kind text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  archived_feedback_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to archive feedback.' using errcode = '42501';
  end if;

  if p_feedback_kind = 'annotation' then
    update public.annotations
    set
      archived_at = now(),
      archived_reason = 'manually_archived'
    where id = p_feedback_id
      and archived_at is null
      and private.is_chapter_owner(chapter_id)
    returning id into archived_feedback_id;
  elsif p_feedback_kind = 'general-comment' then
    update public.chapter_general_comments
    set
      archived_at = now(),
      archived_reason = 'manually_archived'
    where id = p_feedback_id
      and archived_at is null
      and private.is_chapter_owner(chapter_id)
    returning id into archived_feedback_id;
  else
    raise exception 'The feedback kind is invalid.' using errcode = '22023';
  end if;

  if archived_feedback_id is null then
    raise exception 'This active feedback could not be found.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.archive_feedback(uuid, text) from public, anon;
grant execute on function public.archive_feedback(uuid, text) to authenticated;
