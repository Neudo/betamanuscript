import { createNoIndexMetadata } from "@/shared/config/seo";
import { ReaderShell } from "@/features/dashboard/components/ReaderShell";
import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";

export const metadata = createNoIndexMetadata("Reader workspace | BetaManuscript");

export default async function ReaderLayout({ children }: { children: React.ReactNode }) {
  const account = await requireWorkspaceAccount("reader");

  return <ReaderShell account={account}>{children}</ReaderShell>;
}
