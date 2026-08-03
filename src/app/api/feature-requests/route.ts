import { z } from "zod";

import { canWrite } from "@/features/account/domain/user-role";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { featureRequestSchema } from "@/features/feature-requests/schemas/feature-request.schema";
import { sendFeatureRequestEmail } from "@/features/feature-requests/server/feature-request-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = featureRequestSchema.extend({
  manuscriptId: z.string().uuid(),
});

function errorResponse(message: string, status: number) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  let payload: z.infer<typeof requestSchema>;

  try {
    payload = requestSchema.parse(await request.json());
  } catch {
    return errorResponse("Please enter a feature request with a little more detail.", 400);
  }

  const account = await getAuthenticatedAccount();

  if (!account) {
    return errorResponse("You need to sign in before sending a feature request.", 401);
  }

  if (account.role === null || !canWrite(account.role)) {
    return errorResponse("Only writer workspaces can send feature requests.", 403);
  }

  const supabase = await createSupabaseServerClient();
  const { data: manuscript, error: manuscriptError } = await supabase
    .from("manuscripts")
    .select("internal_title")
    .eq("id", payload.manuscriptId)
    .single();

  if (manuscriptError || !manuscript) {
    return errorResponse("This manuscript could not be found.", 404);
  }

  const { data: featureRequest, error: createError } = await supabase
    .from("feature_requests")
    .insert({
      manuscript_id: payload.manuscriptId,
      message: payload.message,
      profile_id: account.id,
    })
    .select("id")
    .single();

  if (createError || !featureRequest) {
    console.error("Feature request creation failed", createError);
    return errorResponse("Your feature request could not be saved. Please try again.", 500);
  }

  try {
    await sendFeatureRequestEmail({
      authorEmail: account.email,
      authorName: account.displayName,
      idempotencyKey: `feature-request/${featureRequest.id}`,
      manuscriptTitle: manuscript.internal_title,
      message: payload.message,
    });
  } catch (emailError) {
    console.error("Feature request email failed", emailError);
    return errorResponse(
      "Your request was saved, but the notification email could not be sent.",
      502,
    );
  }

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
