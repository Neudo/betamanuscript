import { getBlockAnnotationRanges } from "@/features/annotations/lib/multi-block-annotations";
import type {
  ReaderAnnotation,
  ReaderChapterGeneralComment,
  ReaderManuscript,
} from "@/features/reading/api/reading";

export type ReaderChapter = ReaderManuscript["chapters"][number];

export function createOptimisticFeedbackId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `pending-${crypto.randomUUID()}`;
  }

  return `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function addReaderAnnotation(
  chapters: ReaderChapter[],
  annotation: ReaderAnnotation,
) {
  return chapters.map((chapter) => {
    if (chapter.id !== annotation.chapterId) return chapter;

    return {
      ...chapter,
      blocks: chapter.blocks.map((block) => {
        const annotationRanges = getBlockAnnotationRanges(chapter.blocks, block, [annotation]);
        if (annotationRanges.length === 0) return block;

        return {
          ...block,
          annotations: [...block.annotations, ...annotationRanges],
        };
      }),
    };
  });
}

export function removeReaderAnnotation(chapters: ReaderChapter[], annotationId: string) {
  return chapters.map((chapter) => ({
    ...chapter,
    blocks: chapter.blocks.map((block) => ({
      ...block,
      annotations: block.annotations.filter((annotation) => annotation.id !== annotationId),
    })),
  }));
}

export function replaceReaderAnnotation(
  chapters: ReaderChapter[],
  previousAnnotationId: string,
  annotation: ReaderAnnotation,
) {
  return addReaderAnnotation(
    removeReaderAnnotation(chapters, previousAnnotationId),
    annotation,
  );
}

export function setReaderGeneralAnnotation(
  chapters: ReaderChapter[],
  chapterId: string,
  generalComment: ReaderChapterGeneralComment | null,
) {
  return chapters.map((chapter) => (
    chapter.id === chapterId
      ? { ...chapter, generalComment }
      : chapter
  ));
}
