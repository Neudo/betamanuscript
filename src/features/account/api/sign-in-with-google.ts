import {
  getPendingPublicFeedbackToken,
  getPublicReaderPath,
  getSafeDisplayName,
  getSafeInternalPath,
  publicReaderFlow,
} from "@/features/account/domain/auth-redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type GoogleSignInInput = {
  displayName?: string | null;
  feedbackToken?: string | null;
  flow?: "public-reader";
  intent: "login" | "signup";
  next?: string | null;
};

export async function signInWithGoogle({
  displayName,
  feedbackToken,
  flow,
  intent,
  next,
}: GoogleSignInInput) {
  const supabase = createSupabaseBrowserClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  const publicReaderPath = flow === publicReaderFlow
    ? getPublicReaderPath(next)
    : null;
  const redirectTo = publicReaderPath ?? getSafeInternalPath(next);

  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  if (intent === "signup") {
    callbackUrl.searchParams.set("intent", "signup");
  }

  if (publicReaderPath) {
    callbackUrl.searchParams.set("flow", publicReaderFlow);

    const safeDisplayName = getSafeDisplayName(displayName);
    if (safeDisplayName) {
      callbackUrl.searchParams.set("displayName", safeDisplayName);
    }

    const safeFeedbackToken = getPendingPublicFeedbackToken(feedbackToken);
    if (safeFeedbackToken) {
      callbackUrl.searchParams.set("feedback", safeFeedbackToken);
    }
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
