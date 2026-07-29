import { createNoIndexMetadata } from "@/shared/config/seo";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";

export const metadata = createNoIndexMetadata("Author dashboard | BetaManuscript");

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await requireWorkspaceAccount("writer");

  return <DashboardShell account={account}>{children}</DashboardShell>;
}
