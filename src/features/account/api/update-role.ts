import type { UserRole } from "@/features/account/domain/user-role";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function updateRole({
  accountId,
  role,
}: {
  accountId: string;
  role: UserRole;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", accountId);

  if (error) {
    throw new Error(error.message);
  }

  return role;
}
