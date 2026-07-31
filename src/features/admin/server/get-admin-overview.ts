import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AdminOverview = {
  activeCustomerAccountsLast7Days: number;
  annotations: number;
  customerAccounts: number;
  manualProAccounts: number;
  newCustomerAccountsLast30Days: number;
  readerAssignments: number;
  manuscripts: number;
  stripePaidCustomerAccounts: number;
  surveys: number;
};

type CountResult = {
  count: number | null;
  error: { message: string } | null;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createSupabaseAdminClient();
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * DAY_MS).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * DAY_MS).toISOString();

  const [
    customerAccounts,
    manuscripts,
    surveys,
    activeCustomerAccountsLast7Days,
    newCustomerAccountsLast30Days,
    readerAssignments,
    annotations,
    activeStripeSubscriptions,
    manualProEntitlements,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("role", "super_admin"),
    admin.from("manuscripts").select("id", { count: "exact", head: true }),
    admin.from("surveys").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("role", "super_admin")
      .gte("last_active_at", sevenDaysAgo),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("role", "super_admin")
      .gte("created_at", thirtyDaysAgo),
    admin.from("reader_assignments").select("id", { count: "exact", head: true }),
    admin.from("annotations").select("id", { count: "exact", head: true }),
    admin
      .from("stripe_subscriptions")
      .select("profile_id")
      .in("status", ["active", "trialing"])
      .gt("current_period_end", new Date(now).toISOString()),
    admin.from("profile_plan_overrides").select("profile_id, expires_at"),
  ]);

  const stripePaidCustomerAccounts = await countCustomerProfiles(
    admin,
    activeStripeSubscriptions,
    "Stripe-paid customer accounts",
  );
  const manualProAccounts = await countCustomerProfiles(
    admin,
    {
      data: (manualProEntitlements.data ?? []).filter((entitlement) => {
        return !entitlement.expires_at || Date.parse(entitlement.expires_at) > now;
      }),
      error: manualProEntitlements.error,
    },
    "manual Pro accounts",
  );

  return {
    customerAccounts: getCount(customerAccounts, "customer accounts"),
    manuscripts: getCount(manuscripts, "manuscripts"),
    surveys: getCount(surveys, "surveys"),
    activeCustomerAccountsLast7Days: getCount(
      activeCustomerAccountsLast7Days,
      "active customer accounts",
    ),
    stripePaidCustomerAccounts,
    manualProAccounts,
    newCustomerAccountsLast30Days: getCount(
      newCustomerAccountsLast30Days,
      "new customer accounts",
    ),
    readerAssignments: getCount(readerAssignments, "reader assignments"),
    annotations: getCount(annotations, "annotations"),
  };
}

function getCount(result: CountResult, label: string) {
  if (result.error) {
    throw new Error(`Unable to load ${label}: ${result.error.message}`);
  }

  return result.count ?? 0;
}

async function countCustomerProfiles(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  result: {
    data: Array<{ profile_id: string }> | null;
    error: { message: string } | null;
  },
  label: string,
) {
  if (result.error) {
    throw new Error(`Unable to load ${label}: ${result.error.message}`);
  }

  const profileIds = [...new Set((result.data ?? []).map((row) => row.profile_id))];

  if (profileIds.length === 0) {
    return 0;
  }

  const profiles = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .neq("role", "super_admin")
    .in("id", profileIds);

  return getCount(profiles, label);
}
