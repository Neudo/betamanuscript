import type { ReaderAnnotationDraft } from "@/features/reading/api/reading";

export type PendingPublicFeedback =
  | {
    comment: string;
    displayName: string;
    draft: ReaderAnnotationDraft;
    kind: "annotation";
    tagId: string;
  }
  | {
    chapterId: string;
    comment: string;
    displayName: string;
    kind: "general";
  };

export function pendingFeedbackStorageKey(accessLinkId: string) {
  return `betamanuscript.public-feedback.${accessLinkId}`;
}

export function parsePendingPublicFeedback(raw: string | null): PendingPublicFeedback | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as PendingPublicFeedback;
    if (
      value.kind === "annotation"
      && isReaderAnnotationDraft(value.draft)
      && typeof value.comment === "string"
      && isDisplayName(value.displayName)
      && typeof value.tagId === "string"
    ) {
      return value;
    }
    if (
      value.kind === "general"
      && typeof value.chapterId === "string"
      && typeof value.comment === "string"
      && isDisplayName(value.displayName)
    ) {
      return value;
    }
  } catch {
    // A stale session draft must never interrupt access to the manuscript.
  }

  return null;
}

function isDisplayName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 80;
}

function isReaderAnnotationDraft(value: unknown): value is ReaderAnnotationDraft {
  if (!value || typeof value !== "object") return false;

  const draft = value as Record<string, unknown>;
  return typeof draft.chapterBlockId === "string"
    && typeof draft.chapterId === "string"
    && (typeof draft.contextAfter === "string" || draft.contextAfter === null)
    && (typeof draft.contextBefore === "string" || draft.contextBefore === null)
    && typeof draft.quote === "string"
    && typeof draft.selectionEnd === "number"
    && (typeof draft.selectionEndChapterBlockId === "string" || draft.selectionEndChapterBlockId === null)
    && (typeof draft.selectionEndOffset === "number" || draft.selectionEndOffset === null)
    && typeof draft.selectionStart === "number";
}
