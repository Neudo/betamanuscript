import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";
import { SettingsWorkspace } from "@/features/settings/components/SettingsWorkspace";

type ReaderSettingsPageProps = {
  searchParams: Promise<{ section?: string | string[] }>;
};

export default async function ReaderSettingsPage({
  searchParams,
}: ReaderSettingsPageProps) {
  const account = await requireWorkspaceAccount("reader");
  const { section } = await searchParams;

  return (
    <SettingsWorkspace
      account={account}
      initialTab={section === "plan" ? "plan" : "profile"}
    />
  );
}
