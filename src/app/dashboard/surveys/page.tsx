import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";
import { SurveysWorkspace } from "@/features/surveys/components/SurveysWorkspace";

export default async function SurveysPage() {
  const account = await requireWorkspaceAccount("writer");

  return <SurveysWorkspace accountPlan={account.plan} />;
}
