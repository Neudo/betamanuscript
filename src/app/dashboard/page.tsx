import { HydrationBoundary } from "@tanstack/react-query";

import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import {
  getDashboardRouteSelection,
  type DashboardRouteSearchParams,
} from "@/features/dashboard/server/dashboard-route-selection";
import { getDashboardOverviewHydrationState } from "@/features/dashboard/server/get-dashboard-overview-hydration-state";

type DashboardPageProps = {
  searchParams: Promise<DashboardRouteSearchParams>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const state = await getDashboardOverviewHydrationState(getDashboardRouteSelection(params));

  return (
    <HydrationBoundary state={state}>
      <DashboardOverview />
    </HydrationBoundary>
  );
}
