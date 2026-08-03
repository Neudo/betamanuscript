import { NextResponse } from "next/server";

import {
  getPendingPublicFeedbackToken,
  getPublicReaderFeedbackPath,
  getPublicReaderPath,
  getOnboardingPath,
  getSafeDisplayName,
  getSafeInternalPath,
  publicReaderFlow,
} from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import { bindPendingPublicFeedbackToProfile } from "@/features/reading/server/pending-public-feedback";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = getSafeInternalPath(url.searchParams.get("next"));
  const publicReaderPath = url.searchParams.get("flow") === publicReaderFlow
    ? getPublicReaderPath(safeNext)
    : null;
  const requestedDisplayName = getSafeDisplayName(url.searchParams.get("displayName"));
  const pendingFeedbackToken = getPendingPublicFeedbackToken(url.searchParams.get("feedback"));
  const isAccountSignUp = url.searchParams.get("intent") === "signup";
  const isEmailConfirmation = url.searchParams.get("intent") === "confirmation";
  const isPasswordRecovery = url.searchParams.get("intent") === "password-recovery";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (isEmailConfirmation) {
        return publicReaderPath
          ? redirectToPublicReader(url, publicReaderPath, pendingFeedbackToken)
          : redirectToAccountPersonalization(url, safeNext);
      }

      if (isPasswordRecovery) {
        return redirectToPasswordUpdate(url);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (publicReaderPath && pendingFeedbackToken && !isEmailConfirmation) {
          try {
            await bindPendingPublicFeedbackToProfile({
              profileId: user.id,
              token: pendingFeedbackToken,
            });
          } catch (bindingError) {
            console.error("Unable to bind saved public feedback after OAuth", bindingError);
            return redirectToOAuthError(url);
          }
        }

        if (isAccountSignUp) {
          const displayName = requestedDisplayName ?? getGoogleDisplayName(user.user_metadata);
          if (displayName) {
            const admin = createSupabaseAdminClient();
            const { error: profileUpdateError } = await admin
              .from("profiles")
              .update({ display_name: displayName })
              .eq("id", user.id);

            if (profileUpdateError) {
              return redirectToOAuthError(url);
            }
          }

          return publicReaderPath
            ? redirectToPublicReader(url, publicReaderPath, pendingFeedbackToken)
            : redirectToAccountPersonalization(url, safeNext);
        }

        if (publicReaderPath) {
          return redirectToPublicReader(url, publicReaderPath, pendingFeedbackToken);
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
    : isPasswordRecovery
      ? redirectToPasswordRecoveryError(url)
    : redirectToOAuthError(url);
}

function redirectToPublicReader(url: URL, destination: string, pendingFeedbackToken: string | null) {
  const response = NextResponse.redirect(new URL(
    getPublicReaderFeedbackPath(destination, pendingFeedbackToken) ?? destination,
    url.origin,
  ));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function redirectToAccountPersonalization(url: URL, next: string | null) {
  const destination = new URL(getOnboardingPath(next), url.origin);

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function redirectToPasswordUpdate(url: URL) {
  const response = NextResponse.redirect(new URL("/update-password", url.origin));
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

function redirectToPasswordRecoveryError(url: URL) {
  const response = NextResponse.redirect(
    new URL("/login?error=password-recovery", url.origin),
  );
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
