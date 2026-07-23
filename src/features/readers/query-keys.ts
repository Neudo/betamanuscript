export const readerKeys = {
  all: ["readers"] as const,
  rounds: () => [...readerKeys.all, "rounds"] as const,
};
