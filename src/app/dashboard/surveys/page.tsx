import { HydrationBoundary } from "@tanstack/react-query";

import { requireWorkspaceAccount } from "@/features/account/server/require-workspace-account";
import { getManuscriptSurveysWithClient } from "@/features/surveys/api/surveys";
import { SurveysWorkspace } from "@/features/surveys/components/SurveysWorkspace";
import { surveyKeys } from "@/features/surveys/query-keys";
import {
  getDashboardRouteSelection,
  type DashboardRouteSearchParams,
} from "@/features/dashboard/server/dashboard-route-selection";
import { getManuscriptScopedHydrationState } from "@/features/dashboard/server/get-manuscript-scoped-hydration-state";

type SurveysPageProps = {
  searchParams: Promise<DashboardRouteSearchParams>;
};

export default async function SurveysPage({ searchParams }: SurveysPageProps) {
  const account = await requireWorkspaceAccount("writer");
  const selection = getDashboardRouteSelection(await searchParams);
  const state = await getManuscriptScopedHydrationState({
    getData: getManuscriptSurveysWithClient,
    getQueryKey: surveyKeys.manuscript,
    resolveManuscriptId: (manuscripts, requestedManuscriptId) => (
      manuscripts.find((manuscript) => manuscript.id === requestedManuscriptId)?.id
      ?? manuscripts[0]?.id
      ?? null
    ),
    ...selection,
  });

  return (
    <HydrationBoundary state={state}>
      <SurveysWorkspace accountPlan={account.plan} />
    </HydrationBoundary>
  );
}
