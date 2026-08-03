import { z } from "zod";

import { getPendingPublicFeedbackToken } from "@/features/account/domain/auth-redirect";
import { hashPendingPublicFeedbackToken } from "@/features/reading/server/pending-public-feedback";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  token: z.string(),
});

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message, ok: false },
    { headers: { "Cache-Control": "private, no-store" }, status },
  );
}

export async function POST(request: Request) {
  const parsedBody = requestSchema.safeParse(await request.json().catch(() => null));
  const token = parsedBody.success ? getPendingPublicFeedbackToken(parsedBody.data.token) : null;

  if (!token) {
    return errorResponse("The saved feedback is invalid.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return errorResponse("Create an account or sign in before saving feedback.", 401);
  }

  const { error } = await supabase.rpc("finalize_pending_public_feedback", {
    p_token_digest: hashPendingPublicFeedbackToken(token),
  });

  if (error) {
    return errorResponse(error.message, 400);
  }

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
