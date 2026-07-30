import { AdminOverview } from "@/features/admin/components/AdminOverview";
import { getAdminOverview } from "@/features/admin/server/get-admin-overview";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const overview = await getAdminOverview();

  return <AdminOverview overview={overview} />;
}
