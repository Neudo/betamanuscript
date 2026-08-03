import { z } from "zod";

import {
  getOnboardingPath,
  getSafeInternalPath,
} from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { signInSchema } from "@/features/account/schemas/sign-in.schema";
import { verifyTurnstileToken } from "@/features/account/server/verify-turnstile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = signInSchema.extend({
  captchaToken: z.string().trim().min(1).max(2048),
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

  return Response.json(
    {
      ok: true,
      redirectTo:
        profile.role === null
          ? getOnboardingPath(payload.next)
          : getSafeInternalPath(payload.next) ?? getWorkspaceHome(profile.role),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
