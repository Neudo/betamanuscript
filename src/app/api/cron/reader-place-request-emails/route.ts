import { sendReaderPlaceRequestEmail } from "@/features/readers/server/reader-place-request-email";
import { isCronRequestAuthorized } from "@/features/readers/server/cron-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function dashboardUrl() {
  const origin = process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured for reader request notifications.");
  }

  return new URL("/dashboard/readers", origin).toString();
}

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request, process.env.CRON_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: notifications, error: claimError } = await admin.rpc(
    "claim_reader_place_request_email_notifications",
    { p_limit: 20 },
  );

  if (claimError) {
    console.error("Reader-place-request notification claim failed", claimError.code);
    return Response.json({ ok: false }, { status: 500 });
  }

  let sent = 0;
  let retried = 0;

  for (const notification of notifications ?? []) {
    try {
      await sendReaderPlaceRequestEmail({
        dashboardUrl: dashboardUrl(),
        idempotencyKey: `reader-place-request/${notification.outbox_id}`,
        manuscriptTitle: notification.manuscript_title,
        pendingRequestCount: notification.pending_request_count,
        recipientEmail: notification.author_email,
      });

      const { error: markSentError } = await admin.rpc("mark_reader_place_request_email_sent", {
        p_outbox_id: notification.outbox_id,
      });

      if (markSentError) {
        console.error("Reader-place-request notification acknowledgement failed", markSentError.code);
        return Response.json({ ok: false, sent, retried }, { status: 500 });
      }

      sent += 1;
    } catch {
      const { error: retryError } = await admin.rpc("reschedule_reader_place_request_email", {
        p_error: "Delivery attempt failed.",
        p_outbox_id: notification.outbox_id,
      });

      if (retryError) {
        console.error("Reader-place-request notification retry scheduling failed", retryError.code);
      }
      retried += 1;
    }
  }

  return Response.json(
    { ok: true, retried, sent },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
