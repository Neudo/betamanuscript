import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getWorkspaceHome } from "../domain/user-role";
import type { SignUpInput } from "../schemas/sign-up.schema";

export async function signUp(input: SignUpInput) {
  const supabase = createSupabaseBrowserClient();
  const roleHome = getWorkspaceHome(input.role);
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", roleHome);

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
    redirectTo: roleHome,
  };
}
