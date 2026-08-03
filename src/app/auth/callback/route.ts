import { NextResponse } from "next/server";

import {
  getOnboardingPath,
  getSafeInternalPath,
} from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = getSafeInternalPath(url.searchParams.get("next"));
  const isAccountSignUp = url.searchParams.get("intent") === "signup";
  const isEmailConfirmation = url.searchParams.get("intent") === "confirmation";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (isEmailConfirmation) {
        await supabase.auth.signOut();
        return redirectToConfirmedLogin(url, safeNext);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (isAccountSignUp) {
          const displayName = getGoogleDisplayName(user.user_metadata);
          if (displayName) {
            const { error: profileUpdateError } = await supabase
              .from("profiles")
              .update({ display_name: displayName })
              .eq("id", user.id);

            if (profileUpdateError) {
              return redirectToOAuthError(url);
            }
          }

          return redirectToAccountPersonalization(url, safeNext);
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile && profile.role !== null) {
          const response = NextResponse.redirect(
            new URL(safeNext ?? getWorkspaceHome(profile.role), url.origin),
          );
          response.headers.set("Cache-Control", "private, no-store");
          return response;
        }

        return redirectToAccountPersonalization(url, safeNext);
      }
    }
  }

  return isEmailConfirmation
    ? redirectToConfirmationError(url)
    : redirectToOAuthError(url);
}

function redirectToAccountPersonalization(url: URL, next: string | null) {
  const destination = new URL(getOnboardingPath(next), url.origin);

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function redirectToConfirmedLogin(url: URL, next: string | null) {
  const destination = new URL("/login", url.origin);
  destination.searchParams.set("confirmation", "1");

  if (next) {
    destination.searchParams.set("next", next);
  }

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
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

function redirectToConfirmationError(url: URL) {
  const response = NextResponse.redirect(
    new URL("/login?error=confirmation", url.origin),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
