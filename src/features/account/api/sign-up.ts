import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSafeInternalPath } from "../domain/auth-redirect";
import type { SignUpInput } from "../schemas/sign-up.schema";

export async function signUp(input: SignUpInput & { next?: string | null }) {
  const supabase = createSupabaseBrowserClient();
  const safeNext = getSafeInternalPath(input.next);
  const redirectTo = safeNext
    ? `/onboarding?next=${encodeURIComponent(safeNext)}`
    : "/onboarding";
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("intent", "signup");

  if (safeNext) {
    callbackUrl.searchParams.set("next", safeNext);
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    status: data.session ? ("authenticated" as const) : ("confirmation-required" as const),
    redirectTo,
  };
}
