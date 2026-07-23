import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getWorkspaceHome } from "../domain/user-role";
import { getSafeInternalPath } from "../domain/auth-redirect";
import type { SignUpInput } from "../schemas/sign-up.schema";

export async function signUp(input: SignUpInput & { next?: string | null }) {
  const supabase = createSupabaseBrowserClient();
  const roleHome = getWorkspaceHome(input.role);
  const redirectTo = getSafeInternalPath(input.next) ?? roleHome;
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", redirectTo);

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      data: {
        display_name: input.displayName,
        role: input.role,
      },
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
