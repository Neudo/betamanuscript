import { AdminOverview } from "@/features/admin/components/AdminOverview";
import { getAdminOverview } from "@/features/admin/server/get-admin-overview";
import { getFeatureRequests } from "@/features/admin/server/get-feature-requests";
import { getManualProEntitlements } from "@/features/admin/server/get-manual-pro-entitlements";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [overview, entitlements, featureRequests] = await Promise.all([
    getAdminOverview(),
    getManualProEntitlements(),
    getFeatureRequests(),
  ]);

  return (
    <AdminOverview
      overview={overview}
      entitlements={entitlements}
      featureRequests={featureRequests}
    />
  );
}
