import { ReaderShell } from "@/features/dashboard/components/ReaderShell";
import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";

export default async function ReaderLayout({ children }: { children: React.ReactNode }) {
  const account = await requireWorkspaceAccount("reader");

  return <ReaderShell account={account}>{children}</ReaderShell>;
}
