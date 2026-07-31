import "server-only";

import { z } from "zod";

const siteverifyResponseSchema = z.object({
  success: z.boolean(),
});

function getClientIp(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip");

  if (cloudflareIp) {
    return cloudflareIp;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "127.0.0.1";
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function verifyTurnstileToken({
  request,
  token,
}: {
  request: Request;
  token: string;
}) {
  const secret = process.env.TURNSTILE_SECRET;

  if (!secret) {
    console.error("TURNSTILE_SECRET is not configured.");
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: getClientIp(request),
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return false;
    }

    const result = siteverifyResponseSchema.safeParse(await response.json());

    return result.success && result.data.success === true;
  } catch (error) {
    console.error("Cloudflare Turnstile siteverify request failed.", error);
    return false;
  }
}
