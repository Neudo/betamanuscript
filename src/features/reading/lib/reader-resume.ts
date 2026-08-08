import { getReaderManuscriptPath } from "@/features/manuscript/lib/manuscript-url";

type ReaderResumeInput = {
  chapterId: string | null;
  manuscriptTitle: string;
  manuscriptUrlKey: string;
  versionId: string;
};

export function getReaderResumePath({
  chapterId,
  manuscriptTitle,
  manuscriptUrlKey,
  versionId,
}: ReaderResumeInput) {
  const searchParams = new URLSearchParams({ version: versionId });

  if (chapterId) {
    searchParams.set("chapter", chapterId);
  }

  return `${getReaderManuscriptPath({ title: manuscriptTitle, urlKey: manuscriptUrlKey })}?${searchParams.toString()}`;
}
