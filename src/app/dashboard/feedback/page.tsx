import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";
import { FeedbackExplorer } from "@/features/feedback/components/FeedbackExplorer";

export default async function FeedbackPage() {
  const account = await requireWorkspaceAccount("writer");

  return <FeedbackExplorer accountId={account.id} accountPlan={account.plan} />;
}
