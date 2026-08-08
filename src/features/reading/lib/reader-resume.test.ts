import { describe, expect, it } from "vitest";

import { getReaderResumePath } from "./reader-resume";

describe("getReaderResumePath", () => {
  const manuscriptTitle = "Talina's Work";
  const manuscriptUrlKey = "a1b2c3d4e5f6";
  const versionId = "00000000-0000-4000-8000-000000000002";

  it("opens the most recently read chapter when one is available", () => {
    expect(getReaderResumePath({
      chapterId: "00000000-0000-4000-8000-000000000003",
      manuscriptTitle,
      manuscriptUrlKey,
      versionId,
    })).toBe(
      "/reader/talinas-work--a1b2c3d4e5f6?version=00000000-0000-4000-8000-000000000002&chapter=00000000-0000-4000-8000-000000000003",
    );
  });

  it("keeps the manuscript route usable when no chapter progress exists yet", () => {
    expect(getReaderResumePath({ chapterId: null, manuscriptTitle, manuscriptUrlKey, versionId }))
      .toBe("/reader/talinas-work--a1b2c3d4e5f6?version=00000000-0000-4000-8000-000000000002");
  });
});
