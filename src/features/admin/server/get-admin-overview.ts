import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AdminOverview = {
  activeCustomerAccountsLast7Days: number;
  annotations: number;
  customerAccounts: number;
  newCustomerAccountsLast30Days: number;
  paidCustomerAccounts: number;
  readerAssignments: number;
  manuscripts: number;
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
    paidCustomerAccounts,
    newCustomerAccountsLast30Days,
    readerAssignments,
    annotations,
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
      .eq("plan", "pro"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("role", "super_admin")
      .gte("created_at", thirtyDaysAgo),
    admin.from("reader_assignments").select("id", { count: "exact", head: true }),
    admin.from("annotations").select("id", { count: "exact", head: true }),
  ]);

  return {
    customerAccounts: getCount(customerAccounts, "customer accounts"),
    manuscripts: getCount(manuscripts, "manuscripts"),
    surveys: getCount(surveys, "surveys"),
    activeCustomerAccountsLast7Days: getCount(
      activeCustomerAccountsLast7Days,
      "active customer accounts",
    ),
    paidCustomerAccounts: getCount(paidCustomerAccounts, "paid customer accounts"),
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
