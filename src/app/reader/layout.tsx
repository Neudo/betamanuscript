import { createNoIndexMetadata } from "@/shared/config/seo";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";

export const metadata = createNoIndexMetadata("Reader workspace | BetaManuscript");

export default async function ReaderLayout({ children }: { children: React.ReactNode }) {
  const account = await requireWorkspaceAccount("reader");

  return <DashboardShell account={account}>{children}</DashboardShell>;
}
