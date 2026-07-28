export const readerKeys = {
  all: ["readers"] as const,
  manuscripts: () => [...readerKeys.all, "manuscripts"] as const,
};
