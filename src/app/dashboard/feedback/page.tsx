import { HydrationBoundary } from "@tanstack/react-query";

import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";
import { getManuscriptFeedbackWithClient } from "@/features/feedback/api/feedback";
import { FeedbackExplorer } from "@/features/feedback/components/FeedbackExplorer";
import { feedbackKeys } from "@/features/feedback/query-keys";
import {
  getDashboardRouteSelection,
  type DashboardRouteSearchParams,
} from "@/features/dashboard/server/dashboard-route-selection";
import { getManuscriptScopedHydrationState } from "@/features/dashboard/server/get-manuscript-scoped-hydration-state";

type FeedbackPageProps = {
  searchParams: Promise<DashboardRouteSearchParams>;
};

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const account = await requireWorkspaceAccount("writer");
  const selection = getDashboardRouteSelection(await searchParams);
  const state = await getManuscriptScopedHydrationState({
    getData: getManuscriptFeedbackWithClient,
    getQueryKey: feedbackKeys.manuscript,
    ...selection,
  });

  return (
    <HydrationBoundary state={state}>
      <FeedbackExplorer accountId={account.id} accountPlan={account.plan} />
    </HydrationBoundary>
  );
}
