export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (manuscriptId: string) => [...dashboardKeys.all, "overview", manuscriptId] as const,
};
