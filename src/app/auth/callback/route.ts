import { NextResponse } from "next/server";

import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome, type UserRole } from "@/features/account/domain/user-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = getSafeInternalPath(url.searchParams.get("next"));
  const isGoogleSignUp = url.searchParams.get("intent") === "signup";
  const requestedRole = getUserRole(url.searchParams.get("role"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (isGoogleSignUp && requestedRole) {
          const displayName = getGoogleDisplayName(user.user_metadata);
          const { error: profileUpdateError } = await supabase
            .from("profiles")
            .update({
              role: requestedRole,
              ...(displayName ? { display_name: displayName } : {}),
            })
            .eq("id", user.id);

          if (profileUpdateError) {
            return redirectToOAuthError(url);
          }
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) {
          const response = NextResponse.redirect(
            new URL(safeNext ?? getWorkspaceHome(profile.role), url.origin),
          );
          response.headers.set("Cache-Control", "private, no-store");
          return response;
        }
      }
    }
  }

  return redirectToOAuthError(url);
}

function getUserRole(value: string | null): UserRole | null {
  if (value === "reader" || value === "writer" || value === "both") {
    return value;
  }

  return null;
}

function getGoogleDisplayName(metadata: Record<string, unknown>) {
  const candidate = metadata.full_name ?? metadata.name;

  if (typeof candidate !== "string") {
    return null;
  }

  const displayName = candidate.trim();
  return displayName.length >= 2 ? displayName.slice(0, 80) : null;
}

function redirectToOAuthError(url: URL) {
  const response = NextResponse.redirect(
    new URL("/login?error=oauth", url.origin),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
