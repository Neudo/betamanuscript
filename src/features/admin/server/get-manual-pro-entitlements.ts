import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ManualProEntitlement = {
  createdAt: string;
  displayName: string;
  expiresAt: string | null;
  profileId: string;
};

export async function getManualProEntitlements(): Promise<ManualProEntitlement[]> {
  const admin = createSupabaseAdminClient();
  const { data: overrides, error: overridesError } = await admin
    .from("profile_plan_overrides")
    .select("profile_id, expires_at, created_at");

  if (overridesError) {
    throw new Error(`Unable to load manual Pro entitlements: ${overridesError.message}`);
  }

  const now = Date.now();
  const activeOverrides = (overrides ?? []).filter((override) => {
    return !override.expires_at || Date.parse(override.expires_at) > now;
  });

  if (activeOverrides.length === 0) {
    return [];
  }

  const profileIds = activeOverrides.map((override) => override.profile_id);
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, display_name, role")
    .in("id", profileIds)
    .neq("role", "super_admin");

  if (profilesError) {
    throw new Error(`Unable to load manual Pro account details: ${profilesError.message}`);
  }

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return activeOverrides
    .map((override) => {
      const profile = profilesById.get(override.profile_id);

      if (!profile) {
        return null;
      }

      return {
        profileId: override.profile_id,
        displayName: profile.display_name,
        expiresAt: override.expires_at,
        createdAt: override.created_at,
      };
    })
    .filter((entitlement): entitlement is ManualProEntitlement => entitlement !== null)
    .sort((left, right) => {
      if (!left.expiresAt) return -1;
      if (!right.expiresAt) return 1;
      return Date.parse(left.expiresAt) - Date.parse(right.expiresAt);
    });
}
