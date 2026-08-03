import { z } from "zod";

import {
  getPublicReaderPath,
  getSafeDisplayName,
  getSafeInternalPath,
  publicReaderFlow,
} from "@/features/account/domain/auth-redirect";
import { signUpSchema } from "@/features/account/schemas/sign-up.schema";
import { verifyTurnstileToken } from "@/features/account/server/verify-turnstile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = signUpSchema.extend({
  captchaToken: z.string().trim().min(1).max(2048),
  displayName: z.string().trim().max(80).optional(),
  flow: z.literal(publicReaderFlow).optional(),
  next: z.string().nullable().optional(),
});

function appOrigin(request: Request) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredOrigin) {
    return new URL(configuredOrigin).origin;
  }

  return new URL(request.url).origin;
}

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

  const safeNext = getSafeInternalPath(payload.next);
  const publicReaderPath = payload.flow === publicReaderFlow
    ? getPublicReaderPath(safeNext)
    : null;
  const displayName = getSafeDisplayName(payload.displayName);

  if (payload.flow === publicReaderFlow && (!publicReaderPath || !displayName)) {
    return errorResponse("Enter the name you want the author to see.", 400);
  }

  const confirmationUrl = new URL("/auth/callback", appOrigin(request));
  confirmationUrl.searchParams.set("intent", "confirmation");

  if (publicReaderPath) {
    confirmationUrl.searchParams.set("flow", publicReaderFlow);
    confirmationUrl.searchParams.set("next", publicReaderPath);
  } else if (safeNext) {
    confirmationUrl.searchParams.set("next", safeNext);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: confirmationUrl.toString(),
    },
  });

  if (error) {
    return errorResponse(error.message, 400);
  }

  return Response.json(
    {
      ok: true,
      redirectTo: publicReaderPath ?? (safeNext
        ? `/onboarding?next=${encodeURIComponent(safeNext)}`
        : "/onboarding"),
      status: data.session ? "authenticated" : "confirmation-required",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
