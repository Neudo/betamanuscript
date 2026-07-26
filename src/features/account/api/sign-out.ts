import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
