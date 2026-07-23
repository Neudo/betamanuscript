export const manuscriptKeys = {
  all: ["manuscripts"] as const,
  list: () => [...manuscriptKeys.all, "list"] as const,
  detail: (manuscriptId: string) =>
    [...manuscriptKeys.all, "detail", manuscriptId] as const,
  genres: () => [...manuscriptKeys.all, "genres"] as const,
};
