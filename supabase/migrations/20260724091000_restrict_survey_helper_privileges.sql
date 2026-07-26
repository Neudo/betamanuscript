-- The helper is retained for internal compatibility only. It is not an API
-- endpoint and no current RLS policy calls it directly.
revoke all on function private.can_create_survey_submission(uuid, uuid)
from public, anon, authenticated;
