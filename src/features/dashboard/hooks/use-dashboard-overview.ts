"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/api/dashboard";
import { dashboardKeys } from "@/features/dashboard/query-keys";

export function useDashboardOverview(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  return useQuery({
    queryKey: dashboardKeys.overview(manuscriptId ?? "none", manuscriptVersionId),
    queryFn: () => getDashboardOverview(manuscriptId!, manuscriptVersionId),
    enabled: Boolean(manuscriptId),
    staleTime: 30_000,
  });
}
