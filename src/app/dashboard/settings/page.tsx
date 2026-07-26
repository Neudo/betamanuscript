import { SettingsWorkspace } from "@/features/settings/components/SettingsWorkspace";
import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";

type SettingsPageProps = {
  searchParams: Promise<{ section?: string | string[] }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const account = await requireWorkspaceAccount("writer");
  const { section } = await searchParams;

  return (
    <SettingsWorkspace
      account={account}
      initialTab={section === "plan" ? "plan" : "profile"}
    />
  );
}
