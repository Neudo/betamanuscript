import "server-only";

import { getDashboardOverviewWithClient } from "@/features/dashboard/api/dashboard";
import { dashboardKeys } from "@/features/dashboard/query-keys";
import { getManuscriptScopedHydrationState } from "@/features/dashboard/server/get-manuscript-scoped-hydration-state";

type DashboardOverviewHydrationInput = {
  manuscriptId: string | null;
  manuscriptVersionId: string | null;
};

export async function getDashboardOverviewHydrationState({
  manuscriptId,
  manuscriptVersionId,
}: DashboardOverviewHydrationInput) {
  return getManuscriptScopedHydrationState({
    getData: getDashboardOverviewWithClient,
    getQueryKey: dashboardKeys.overview,
    manuscriptId,
    manuscriptVersionId,
  });
}
