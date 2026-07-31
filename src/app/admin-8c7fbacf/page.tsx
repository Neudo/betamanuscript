import { AdminOverview } from "@/features/admin/components/AdminOverview";
import { getAdminOverview } from "@/features/admin/server/get-admin-overview";
import { getManualProEntitlements } from "@/features/admin/server/get-manual-pro-entitlements";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [overview, entitlements] = await Promise.all([
    getAdminOverview(),
    getManualProEntitlements(),
  ]);

  return <AdminOverview overview={overview} entitlements={entitlements} />;
}
