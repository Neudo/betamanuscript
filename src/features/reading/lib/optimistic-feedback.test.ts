import { describe, expect, it } from "vitest";

import type { ReaderAnnotation, ReaderManuscript } from "@/features/reading/api/reading";
import { createPlainRichText } from "@/features/manuscript/lib/rich-text";

import {
  addReaderAnnotation,
  removeReaderAnnotation,
  replaceReaderAnnotation,
  setReaderGeneralAnnotation,
} from "./optimistic-feedback";

const chapters = [
  {
    blocks: [
      { annotations: [], content: "First passage.", id: "block-1", position: 1, richContent: createPlainRichText("First passage.") },
      { annotations: [], content: "Second passage.", id: "block-2", position: 2, richContent: createPlainRichText("Second passage.") },
    ],
    generalComment: null,
    id: "chapter-1",
    position: 1,
    title: "Chapter one",
  },
] as ReaderManuscript["chapters"];

const annotation: ReaderAnnotation = {
  chapterBlockId: "block-1",
  chapterId: "chapter-1",
  comment: "A useful note",
  contextAfter: null,
  contextBefore: null,
  id: "temporary-annotation",
  quote: "passage.\n\nSecond",
  selectionEnd: "First passage.".length,
  selectionEndChapterBlockId: "block-2",
  selectionEndOffset: "Second".length,
  selectionStart: 6,
  tag: { color: "#000000", id: "tag-1", label: "Pacing", slug: "pacing" },
};

describe("optimistic reader feedback", () => {
  it("adds a multi-block annotation as a range in every selected block", () => {
    const nextChapters = addReaderAnnotation(chapters, annotation);

    expect(nextChapters[0].blocks[0].annotations).toMatchObject([
      { id: "temporary-annotation", selectionStart: 6, selectionEnd: "First passage.".length },
    ]);
    expect(nextChapters[0].blocks[1].annotations).toMatchObject([
      { id: "temporary-annotation", selectionStart: 0, selectionEnd: "Second".length },
    ]);
  });

  it("replaces or removes a temporary annotation without touching other feedback", () => {
    const optimisticChapters = addReaderAnnotation(chapters, annotation);
    const savedAnnotation = { ...annotation, id: "saved-annotation" };

    expect(replaceReaderAnnotation(optimisticChapters, annotation.id, savedAnnotation)[0].blocks[0].annotations)
      .toMatchObject([{ id: "saved-annotation" }]);
    expect(removeReaderAnnotation(optimisticChapters, annotation.id)[0].blocks[0].annotations)
      .toHaveLength(0);
  });

  it("updates a chapter's general annotation in place", () => {
    expect(setReaderGeneralAnnotation(chapters, "chapter-1", {
      comment: "The chapter ending works.",
      id: "general-annotation",
    })[0].generalComment).toEqual({
      comment: "The chapter ending works.",
      id: "general-annotation",
    });
  });
});
