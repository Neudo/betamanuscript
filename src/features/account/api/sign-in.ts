import { getSafeInternalPath } from "@/features/account/domain/auth-redirect";
import { getWorkspaceHome } from "@/features/account/domain/user-role";
import type { SignInInput } from "@/features/account/schemas/sign-in.schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function signIn(input: SignInInput & { next?: string | null }) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(
      error.code === "invalid_credentials"
        ? "Email or password is incorrect."
        : error.message,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error("Your account profile could not be loaded.");
  }

  return {
    redirectTo:
      getSafeInternalPath(input.next) ?? getWorkspaceHome(profile.role),
  };
}
