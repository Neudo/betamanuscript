-- Reader-facing RPCs run as SECURITY INVOKER. PostgreSQL therefore checks
-- the caller's ability to resolve the private schema before executing the
-- authorization helper used inside those RPCs.
--
-- Keep the helper private to the application: only signed-in users can
-- resolve the schema and execute this narrowly scoped boolean function. The
-- helper itself still verifies auth.uid(), assignment ownership and survey
-- eligibility, so this does not grant access to any survey data.
revoke all on schema private from anon;
grant usage on schema private to authenticated;

revoke all on function private.can_assignment_answer_survey(uuid, uuid) from public, anon;
grant execute on function private.can_assignment_answer_survey(uuid, uuid) to authenticated;
