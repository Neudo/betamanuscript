-- This private helper is evaluated by the authenticated annotation INSERT policy.
-- It remains unavailable to anonymous callers and to PUBLIC.
grant execute on function private.is_active_manuscript_tag_for_chapter(uuid, uuid)
to authenticated;
