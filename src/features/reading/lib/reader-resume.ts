type ReaderResumeInput = {
  chapterId: string | null;
  manuscriptId: string;
  versionId: string;
};

export function getReaderResumePath({
  chapterId,
  manuscriptId,
  versionId,
}: ReaderResumeInput) {
  const searchParams = new URLSearchParams({ version: versionId });

  if (chapterId) {
    searchParams.set("chapter", chapterId);
  }

  return `/reader/${manuscriptId}?${searchParams.toString()}`;
}
