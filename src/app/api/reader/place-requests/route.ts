import { z } from "zod";

import { sendReaderPlaceRequestEmail } from "@/features/readers/server/reader-place-request-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  accessLinkId: z.string().uuid(),
});

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message, ok: false },
    { headers: { "Cache-Control": "private, no-store" }, status },
  );
}

function dashboardUrl() {
  const origin = process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured for reader request notifications.");
  }

  return new URL("/dashboard/readers", origin).toString();
}

async function markNotificationSent({
  admin,
  outboxId,
  readingRoundId,
  sentAt,
}: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  outboxId: string | null;
  readingRoundId: string;
  sentAt: string;
}) {
  const { error: stateError } = await admin
    .from("reader_place_request_notification_state")
    .update({ last_email_sent_at: sentAt, last_notified_request_at: sentAt })
    .eq("reading_round_id", readingRoundId);

  if (stateError) {
    console.error("Reader-place-request notification state acknowledgement failed", stateError.code);
  }

  if (outboxId) {
    const { error: outboxError } = await admin
      .from("reader_place_request_email_outbox")
      .update({
        last_error: null,
        processing_started_at: null,
        sent_at: sentAt,
        status: "sent",
      })
      .eq("id", outboxId);

    if (outboxError) {
      console.error("Reader-place-request notification outbox acknowledgement failed", outboxError.code);
    }
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return errorResponse("Invalid place request.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return errorResponse("Create an account or sign in before requesting a place.", 401);
  }

  const { data: placeRequests, error: placeRequestError } = await supabase.rpc(
    "create_reader_place_request",
    { p_public_link_id: parsedBody.data.accessLinkId },
  );
  const placeRequest = placeRequests?.[0];

  if (placeRequestError) {
    return errorResponse(placeRequestError.message, 400);
  }
  if (!placeRequest) {
    return errorResponse("The place request could not be created.", 500);
  }

  const admin = createSupabaseAdminClient();
  const { data: requestRecord, error: requestRecordError } = await admin
    .from("reader_place_requests")
    .select("author_profile_id, reading_round_id")
    .eq("id", placeRequest.request_id)
    .maybeSingle();

  if (requestRecordError || !requestRecord) {
    console.error("Unable to load the reader place request for notification", requestRecordError?.code);
    return errorResponse("Your request was saved, but the author could not be notified. Please try again.", 502);
  }

  const [{ data: readingRound, error: readingRoundError }, { data: authorData, error: authorError }, { count, error: countError }, { data: outbox, error: outboxError }] = await Promise.all([
    admin
      .from("reading_rounds")
      .select("manuscript_version_id")
      .eq("id", requestRecord.reading_round_id)
      .maybeSingle(),
    admin.auth.admin.getUserById(requestRecord.author_profile_id),
    admin
      .from("reader_place_requests")
      .select("id", { count: "exact", head: true })
      .eq("reading_round_id", requestRecord.reading_round_id)
      .eq("status", "pending"),
    admin
      .from("reader_place_request_email_outbox")
      .select("id")
      .eq("reading_round_id", requestRecord.reading_round_id)
      .in("status", ["pending", "processing"])
      .maybeSingle(),
  ]);

  if (readingRoundError || !readingRound || authorError || !authorData.user?.email || countError || outboxError) {
    console.error("Unable to prepare reader place request notification", {
      authorError: authorError?.message,
      countError: countError?.code,
      outboxError: outboxError?.code,
      readingRoundError: readingRoundError?.code,
    });
    return errorResponse("Your request was saved, but the author could not be notified. Please try again.", 502);
  }

  const { data: manuscriptVersion, error: manuscriptVersionError } = await admin
    .from("manuscript_versions")
    .select("title")
    .eq("id", readingRound.manuscript_version_id)
    .maybeSingle();

  if (manuscriptVersionError || !manuscriptVersion) {
    console.error("Unable to load manuscript title for reader place request notification", manuscriptVersionError?.code);
    return errorResponse("Your request was saved, but the author could not be notified. Please try again.", 502);
  }

  try {
    await sendReaderPlaceRequestEmail({
      dashboardUrl: dashboardUrl(),
      idempotencyKey: `reader-place-request/${outbox?.id ?? placeRequest.request_id}`,
      manuscriptTitle: manuscriptVersion.title,
      pendingRequestCount: count ?? 1,
      recipientEmail: authorData.user.email,
    });
  } catch (error) {
    console.error("Reader-place-request notification delivery failed", error instanceof Error ? error.message : "unknown error");
    return errorResponse("Your request was saved, but the author could not be notified. Please try again.", 502);
  }

  await markNotificationSent({
    admin,
    outboxId: outbox?.id ?? null,
    readingRoundId: requestRecord.reading_round_id,
    sentAt: new Date().toISOString(),
  });

  return Response.json(
    {
      ok: true,
      request: {
        requestId: placeRequest.request_id,
        status: placeRequest.status,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
