import { z } from "zod";

import {
  getPendingPublicFeedbackToken,
  getPublicReaderFeedbackPath,
  getPublicReaderPath,
  getOnboardingPath,
  getSafeInternalPath,
  publicReaderFlow,
} from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { signInSchema } from "@/features/account/schemas/sign-in.schema";
import { bindPendingPublicFeedbackToProfile } from "@/features/reading/server/pending-public-feedback";
import { verifyTurnstileToken } from "@/features/account/server/verify-turnstile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = signInSchema.extend({
  captchaToken: z.string().trim().min(1).max(2048),
  feedbackToken: z.string().optional(),
  flow: z.literal(publicReaderFlow).optional(),
  next: z.string().nullable().optional(),
});

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message, ok: false },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

export async function POST(request: Request) {
  let payload: z.infer<typeof requestSchema>;

  try {
    payload = requestSchema.parse(await request.json());
  } catch {
    return errorResponse("Enter a valid email address and password.", 400);
  }

  const isVerified = await verifyTurnstileToken({
    request,
    token: payload.captchaToken,
  });

  if (!isVerified) {
    return errorResponse("Verification failed. Please try again.", 403);
  }

  const publicReaderPath = payload.flow === publicReaderFlow
    ? getPublicReaderPath(payload.next)
    : null;
  const feedbackToken = getPendingPublicFeedbackToken(payload.feedbackToken);

  if (payload.feedbackToken && !feedbackToken) {
    return errorResponse("The saved feedback is invalid.", 400);
  }

  if (feedbackToken && !publicReaderPath) {
    return errorResponse("The saved feedback needs a valid manuscript link.", 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error || !data.user) {
    return errorResponse(
      error?.code === "invalid_credentials"
        ? "Email or password is incorrect."
        : "Could not log you in. Please try again.",
      401,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return errorResponse("Your account profile could not be loaded.", 500);
  }

  if (feedbackToken) {
    try {
      await bindPendingPublicFeedbackToProfile({
        profileId: data.user.id,
        token: feedbackToken,
      });
    } catch (bindingError) {
      console.error("Unable to bind saved public feedback to the signed-in account", bindingError);
      return errorResponse("Your feedback could not be secured. Please try again.", 500);
    }
  }

  return Response.json(
    {
      ok: true,
      redirectTo:
        publicReaderPath
          ? getPublicReaderFeedbackPath(publicReaderPath, feedbackToken)
          : profile.role === null
          ? getOnboardingPath(payload.next)
          : getSafeInternalPath(payload.next) ?? getWorkspaceHome(profile.role),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
