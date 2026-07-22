import { SettingsWorkspace } from "@/features/settings/components/SettingsWorkspace";

type SettingsPageProps = {
  searchParams: Promise<{ section?: string | string[] }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { section } = await searchParams;

  return <SettingsWorkspace initialTab={section === "plan" ? "plan" : "profile"} />;
}
