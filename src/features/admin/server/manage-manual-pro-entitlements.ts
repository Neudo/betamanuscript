"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/features/account/server/require-super-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConsolePath } from "@/shared/config/admin";

const profileIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ManualProDuration = "permanent" | "30_days" | "90_days" | "1_year";

const manualProDurations = ["permanent", "30_days", "90_days", "1_year"] as const;

const durationInDays: Record<Exclude<ManualProDuration, "permanent">, number> = {
  "30_days": 30,
  "90_days": 90,
  "1_year": 365,
};

export async function grantManualProEntitlement({
  duration,
  profileId,
}: {
  duration: ManualProDuration;
  profileId: string;
}) {
  const superAdmin = await requireSuperAdmin();

  if (typeof profileId !== "string" || typeof duration !== "string") {
    throw new Error("Enter a valid account and Pro access duration.");
  }

  const normalizedProfileId = profileId.trim();

  if (!profileIdPattern.test(normalizedProfileId)) {
    throw new Error("Enter a valid account ID.");
  }

  if (!manualProDurations.includes(duration as ManualProDuration)) {
    throw new Error("Choose a valid Pro access duration.");
  }

  const admin = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", normalizedProfileId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to find this account: ${profileError.message}`);
  }

  if (!profile) {
    throw new Error("No account matches this ID.");
  }

  if (profile.role === "super_admin") {
    throw new Error("Manual Pro access is reserved for customer accounts.");
  }

  const expiresAt = duration === "permanent"
    ? null
    : new Date(Date.now() + durationInDays[duration] * 24 * 60 * 60 * 1000).toISOString();

  const { error: entitlementError } = await admin
    .from("profile_plan_overrides")
    .upsert(
      {
        profile_id: profile.id,
        expires_at: expiresAt,
        granted_by: superAdmin.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" },
    );

  if (entitlementError) {
    throw new Error(`Unable to grant manual Pro access: ${entitlementError.message}`);
  }

  revalidatePath(adminConsolePath);

  return { displayName: profile.display_name, expiresAt };
}

export async function revokeManualProEntitlement(profileId: string) {
  await requireSuperAdmin();

  if (typeof profileId !== "string") {
    throw new Error("The account ID is invalid.");
  }

  const normalizedProfileId = profileId.trim();

  if (!profileIdPattern.test(normalizedProfileId)) {
    throw new Error("The account ID is invalid.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profile_plan_overrides")
    .delete()
    .eq("profile_id", normalizedProfileId);

  if (error) {
    throw new Error(`Unable to revoke manual Pro access: ${error.message}`);
  }

  revalidatePath(adminConsolePath);
}
