export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (manuscriptId: string, manuscriptVersionId?: string | null) =>
    [
      ...dashboardKeys.all,
      "overview",
      manuscriptId,
      ...(manuscriptVersionId ? [manuscriptVersionId] : []),
    ] as const,
};
