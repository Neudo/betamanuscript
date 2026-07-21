import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SignUpInput } from "../schemas/sign-up.schema";

export async function signUp(input: SignUpInput) {
  const supabase = createSupabaseBrowserClient();
  const emailRedirectTo = `${window.location.origin}/auth/callback`;
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo,
      data: {
        display_name: input.displayName,
        role: input.role,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
