export const readerKeys = {
  all: ["readers"] as const,
  inviteableChapters: (manuscriptId: string) => [...readerKeys.all, "inviteable-chapters", manuscriptId] as const,
  manuscripts: () => [...readerKeys.all, "manuscripts"] as const,
};
