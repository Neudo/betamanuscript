import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type GoogleSignInInput = {
  intent: "login" | "signup";
  next?: string | null;
};

export async function signInWithGoogle({
  intent,
  next,
}: GoogleSignInInput) {
  const supabase = createSupabaseBrowserClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  const redirectTo = getSafeInternalPath(next);

  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  if (intent === "signup") {
    callbackUrl.searchParams.set("intent", "signup");
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
