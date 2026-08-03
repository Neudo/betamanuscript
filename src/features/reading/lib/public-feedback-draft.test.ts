import { describe, expect, it } from "vitest";

import {
  parsePendingPublicFeedback,
  pendingFeedbackStorageKey,
} from "./public-feedback-draft";

const annotationDraft = {
  chapterBlockId: "block-1",
  chapterId: "chapter-1",
  contextAfter: null,
  contextBefore: "Before",
  quote: "A selected passage",
  selectionEnd: 18,
  selectionEndChapterBlockId: null,
  selectionEndOffset: null,
  selectionStart: 2,
};

describe("public feedback draft", () => {
  it("uses a link-scoped session-storage key", () => {
    expect(pendingFeedbackStorageKey("link-a")).toBe("betamanuscript.public-feedback.link-a");
    expect(pendingFeedbackStorageKey("link-a")).not.toBe(pendingFeedbackStorageKey("link-b"));
  });

  it("ignores an absent draft", () => {
    expect(parsePendingPublicFeedback(null)).toBeNull();
  });

  it("ignores malformed JSON", () => {
    expect(parsePendingPublicFeedback("not json")).toBeNull();
  });

  it("restores a complete passage annotation draft", () => {
    expect(parsePendingPublicFeedback(JSON.stringify({
      comment: "The rhythm loses me here.",
      displayName: "Alex Reader",
      draft: annotationDraft,
      kind: "annotation",
      tagId: "tag-1",
    }))).toEqual({
      comment: "The rhythm loses me here.",
      displayName: "Alex Reader",
      draft: annotationDraft,
      kind: "annotation",
      tagId: "tag-1",
    });
  });

  it("does not restore an annotation without a tag", () => {
    expect(parsePendingPublicFeedback(JSON.stringify({
      comment: "A comment",
      draft: annotationDraft,
      kind: "annotation",
    }))).toBeNull();
  });

  it("does not restore an annotation with an incomplete selection", () => {
    expect(parsePendingPublicFeedback(JSON.stringify({
      comment: "A comment",
      draft: { chapterId: "chapter-1" },
      kind: "annotation",
      tagId: "tag-1",
    }))).toBeNull();
  });

  it("restores a chapter general annotation", () => {
    expect(parsePendingPublicFeedback(JSON.stringify({
      chapterId: "chapter-1",
      comment: "The chapter ending works.",
      displayName: "Alex Reader",
      kind: "general",
    }))).toEqual({
      chapterId: "chapter-1",
      comment: "The chapter ending works.",
      displayName: "Alex Reader",
      kind: "general",
    });
  });

  it("does not restore a general annotation without its chapter", () => {
    expect(parsePendingPublicFeedback(JSON.stringify({
      comment: "The chapter ending works.",
      kind: "general",
    }))).toBeNull();
  });
});
