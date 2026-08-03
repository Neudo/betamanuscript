import type { WorkspaceRole } from "@/features/account/domain/user-role";
import {
  accountPersonalizationSchema,
  type AccountPersonalizationInput,
} from "@/features/account/schemas/account-personalization.schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  removeProfileAvatarFile,
  uploadAvatarFile,
} from "@/features/account/api/profile-settings";

export async function personalizeAccount({
  accountId,
  displayName,
  role,
  avatarFile,
  previousAvatarPath,
}: AccountPersonalizationInput & {
  accountId: string;
  avatarFile: File | null;
  previousAvatarPath: string | null;
}) {
  const settings = accountPersonalizationSchema.parse({ displayName, role });
  const supabase = createSupabaseBrowserClient();
  const avatar = avatarFile ? await uploadAvatarFile(avatarFile) : null;
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: settings.displayName,
      role: settings.role,
      ...(avatar ? { avatar_path: avatar.avatarPath } : {}),
    })
    .eq("id", accountId)
    .select("display_name, role")
    .single();

  if (error) {
    if (avatar) {
      await removeProfileAvatarFile(avatar.avatarPath);
    }
    throw new Error(error.message);
  }

  if (avatar && previousAvatarPath) {
    await removeProfileAvatarFile(previousAvatarPath);
  }

  return {
    displayName: data.display_name,
    role: data.role as WorkspaceRole,
  };
}
