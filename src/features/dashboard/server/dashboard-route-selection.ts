import "server-only";

export type DashboardRouteSearchParams = {
  manuscript?: string | string[];
  manuscriptId?: string | string[];
  versionId?: string | string[];
};

function firstSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0] ?? null;
}

export function getDashboardRouteSelection(params: DashboardRouteSearchParams) {
  return {
    manuscriptId: firstSearchParam(params.manuscriptId),
    manuscriptReference: firstSearchParam(params.manuscript),
    manuscriptVersionId: firstSearchParam(params.versionId),
  };
}
