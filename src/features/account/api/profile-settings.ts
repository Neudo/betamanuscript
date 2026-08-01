import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import {
  profileSettingsSchema,
  type ProfileSettingsInput,
} from "../schemas/profile-settings.schema";

const PROFILE_AVATARS_BUCKET = "profile-avatars";
const MAX_AVATAR_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const avatarExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function getAvatarFileError(file: File) {
  if (!(file.type in avatarExtensions)) {
    return "Choose a JPG, PNG, or WEBP image.";
  }

  if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
    return "The profile photo must be 2 MB or smaller.";
  }

  return null;
}

export async function updateProfileSettings(input: ProfileSettingsInput) {
  const settings = profileSettingsSchema.parse(input);
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Sign in to update your profile.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      bio: settings.bio,
      display_name: settings.displayName,
      website: settings.website,
    })
    .eq("id", user.id)
    .select("bio, display_name, website")
    .single();

  if (error) throw new Error(error.message);

  return {
    bio: data.bio ?? "",
    displayName: data.display_name,
    website: data.website ?? "",
  };
}

export async function uploadProfileAvatar({
  file,
  previousPath,
}: {
  file: File;
  previousPath: string | null;
}) {
  const validationError = getAvatarFileError(file);
  if (validationError) throw new Error(validationError);

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Sign in to upload a profile photo.");
  }

  const extension = avatarExtensions[file.type as keyof typeof avatarExtensions];
  const storagePath = `${user.id}/avatar-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_path: storagePath })
    .eq("id", user.id)
    .select("avatar_path")
    .single();

  if (profileError || !profile) {
    await supabase.storage.from(PROFILE_AVATARS_BUCKET).remove([storagePath]);
    throw new Error(profileError?.message ?? "Unable to save your profile photo.");
  }

  if (previousPath) {
    const { error: deleteError } = await supabase.storage
      .from(PROFILE_AVATARS_BUCKET)
      .remove([previousPath]);

    if (deleteError) {
      console.warn("Unable to remove the replaced profile photo.", deleteError);
    }
  }

  const { data: signedUrl } = await supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .createSignedUrl(profile.avatar_path, 60 * 60);

  return {
    avatarPath: profile.avatar_path,
    avatarUrl: signedUrl?.signedUrl ?? null,
  };
}
