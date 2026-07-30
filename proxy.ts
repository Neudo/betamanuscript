import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

const ANALYTICS_OPT_OUT_COOKIE = "betamanuscript_analytics_opt_out";

const sessionPaths = ["/dashboard", "/reader", "/auth"];

function shouldUpdateSupabaseSession(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onboarding" ||
    sessionPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  );
}

function getInternalAnalyticsIps() {
  return new Set(
    (process.env.POSTHOG_INTERNAL_IPS ?? "")
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean),
  );
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    undefined
  );
}

function applyAnalyticsOptOut(request: NextRequest, response: NextResponse) {
  const internalAnalyticsIps = getInternalAnalyticsIps();
  const clientIp = getClientIp(request);
  const shouldOptOut =
    clientIp !== undefined && internalAnalyticsIps.has(clientIp);

  if (shouldOptOut) {
    response.cookies.set(ANALYTICS_OPT_OUT_COOKIE, "1", {
      maxAge: 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else if (request.cookies.has(ANALYTICS_OPT_OUT_COOKIE)) {
    response.cookies.delete(ANALYTICS_OPT_OUT_COOKIE);
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const response = shouldUpdateSupabaseSession(request.nextUrl.pathname)
    ? await updateSupabaseSession(request)
    : NextResponse.next({ request });

  return applyAnalyticsOptOut(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
