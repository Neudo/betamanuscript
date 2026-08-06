-- The manual Pro override trigger runs as service_role. It needs to resolve
-- the private billing refresh function. Browser-facing database roles retain
-- no EXECUTE privilege on that function or INSERT privilege on the override table.
grant usage on schema private to service_role;

revoke all on function private.refresh_profile_billing_plan(uuid) from public, anon, authenticated;
grant execute on function private.refresh_profile_billing_plan(uuid) to service_role;
