# Manuscript upload before signup

The landing hero uploads directly to the private `pending-manuscripts` bucket using a signed, non-overwriting upload URL. The initialization route requires Turnstile, a same-origin request, supported filename/size, and a database rate limit of five reservations per IP fingerprint per hour. The server verifies the stored size and basic file signature before marking an upload ready; the existing document parser validates its structure when the authenticated user resumes.

The URL carries only an upload UUID. A four-hour HttpOnly cookie carries a separate random capability, stored as a SHA-256 digest in the database. Anonymous callers cannot query the table or read the bucket. Signup binds a real created user (excluding Supabase's obfuscated existing-user response); OAuth and password login bind after authentication. Once bound, the account can retrieve the upload without the initial cookie. Existing email confirmation mechanics remain in use.

`/import-manuscript?upload=…` retrieves the file and detects chapters, then opens the single creation form with its file already present. The database creation wrapper keeps the original RLS/quotas by running as SECURITY INVOKER and remembers creation identifiers atomically. Finishing copies the original file into `manuscript-sources` server-side, records the asset, and marks the temporary copy completed. Retrying does not create a second manuscript.

Unclaimed uploads expire four hours after reservation. The hourly cleanup function selects expired anonymous uploads or completed copies past their original expiry, marks them deleting, removes Storage objects, then deletes their tracking rows. Completed copies remain until the original expiry to prevent reuse of a still-valid signed upload URL after deletion. Failed deletions remain retryable. Claimed uploads are retained until consumed; account deletion makes abandoned uploads eligible again. Each invocation processes at most 1,000 files. Storage/worker outages can delay physical cleanup.

## Deployment order

Production application was blocked by automatic approval review; no remote schema/function/schedule changes have been made for this feature.

1. Apply `20260909100000_add_pending_manuscript_uploads.sql` to the BetaManuscript project.
2. Deploy `supabase/functions/cleanup-manuscript-uploads/index.ts` and `cleanup.ts` as `cleanup-manuscript-uploads`. Set `verify_jwt: false`: this endpoint implements custom authentication using the `x-cleanup-token` header and a service-only authorization RPC. It accepts no request without the Vault secret. It uses the Edge runtime's existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Apply `20260909101000_schedule_manuscript_upload_cleanup.sql`. It generates the secret inside Vault and configures the hourly cron. The endpoint URL targets the verified BetaManuscript project; change that Vault URL when deploying to a different project.
4. Deploy the Next.js changes. Existing `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and Supabase public settings are required. No service secret is sent to the client.

The second migration must precede enabling the cron's first successful run: until its authorization RPC exists, the worker fails closed. Do not expose the hero upload in production before the database migration exists.

## Verification

- `pnpm test`: ownership/cookie/expiry tests, metadata/signature checks and Storage-before-row cleanup tests, plus the existing suite.
- `pnpm exec tsc --noEmit --incremental false` and ESLint on modified files.
- `PGLITE_MODULE=/path/to/@electric-sql/pglite/dist/index.js node scripts/verification/pending-manuscript-upload.mjs`: isolated PostgreSQL assertions against the real first migration, with minimal fixtures for existing auth/storage tables and the existing creation function. Validates grants, rate limits, expiry, claim rejection, idempotent creation, invoker security and retryable cleanup. Does not test actual Supabase Storage, Vault, pg_net or email delivery.
- Live verification after deployment: upload a disposable manuscript, reload signup, register or log in, finish creation, retry, and verify the permanent source and imported chapters. Check an expired unclaimed test upload is deleted by the worker, while a claimed upload remains. Confirm missing/wrong cleanup credentials are rejected. Do not use real customer manuscripts for cleanup tests.
