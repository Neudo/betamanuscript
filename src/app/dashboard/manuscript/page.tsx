import { HydrationBoundary } from "@tanstack/react-query";

import { getManuscriptWithClient } from "@/features/manuscript/api/manuscripts";
import { ManuscriptWorkspace } from "@/features/manuscript/components/ManuscriptWorkspace";
import { manuscriptKeys } from "@/features/manuscript/query-keys";
import {
  getDashboardRouteSelection,
  type DashboardRouteSearchParams,
} from "@/features/dashboard/server/dashboard-route-selection";
import { getManuscriptScopedHydrationState } from "@/features/dashboard/server/get-manuscript-scoped-hydration-state";

type ManuscriptPageProps = {
  searchParams: Promise<DashboardRouteSearchParams>;
};

export default async function ManuscriptPage({ searchParams }: ManuscriptPageProps) {
  const selection = getDashboardRouteSelection(await searchParams);
  const state = await getManuscriptScopedHydrationState({
    getData: getManuscriptWithClient,
    getQueryKey: manuscriptKeys.detail,
    ...selection,
  });

  return (
    <HydrationBoundary state={state}>
      <ManuscriptWorkspace />
    </HydrationBoundary>
  );
}
