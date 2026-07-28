export const manuscriptKeys = {
  all: ["manuscripts"] as const,
  list: () => [...manuscriptKeys.all, "list"] as const,
  detail: (manuscriptId: string, manuscriptVersionId?: string | null) =>
    [
      ...manuscriptKeys.all,
      "detail",
      manuscriptId,
      ...(manuscriptVersionId ? [manuscriptVersionId] : []),
    ] as const,
  genres: () => [...manuscriptKeys.all, "genres"] as const,
};
