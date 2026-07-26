import type { AccountPersonalizationInput } from "@/features/account/schemas/account-personalization.schema";
import type { UserRole } from "@/features/account/domain/user-role";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function personalizeAccount({
  accountId,
  displayName,
  role,
}: AccountPersonalizationInput & { accountId: string }) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, role })
    .eq("id", accountId)
    .select("display_name, role")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    displayName: data.display_name,
    role: data.role as UserRole,
  };
}
