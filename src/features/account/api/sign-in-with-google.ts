import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome, type UserRole } from "@/features/account/domain/user-role";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type GoogleSignInInput = {
  intent: "login" | "signup";
  next?: string | null;
  role?: UserRole;
};

export async function signInWithGoogle({
  intent,
  next,
  role,
}: GoogleSignInInput) {
  const supabase = createSupabaseBrowserClient();
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  const redirectTo =
    getSafeInternalPath(next) ??
    (intent === "signup" ? getWorkspaceHome(role ?? "writer") : null);

  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  if (intent === "signup") {
    callbackUrl.searchParams.set("intent", "signup");
    callbackUrl.searchParams.set("role", role ?? "writer");
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
