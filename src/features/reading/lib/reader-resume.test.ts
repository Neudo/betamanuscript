import { describe, expect, it } from "vitest";

import { getReaderResumePath } from "./reader-resume";

describe("getReaderResumePath", () => {
  const manuscriptId = "00000000-0000-4000-8000-000000000001";
  const versionId = "00000000-0000-4000-8000-000000000002";

  it("opens the most recently read chapter when one is available", () => {
    expect(getReaderResumePath({
      chapterId: "00000000-0000-4000-8000-000000000003",
      manuscriptId,
      versionId,
    })).toBe(
      `/reader/${manuscriptId}?version=${versionId}&chapter=00000000-0000-4000-8000-000000000003`,
    );
  });

  it("keeps the manuscript route usable when no chapter progress exists yet", () => {
    expect(getReaderResumePath({ chapterId: null, manuscriptId, versionId }))
      .toBe(`/reader/${manuscriptId}?version=${versionId}`);
  });
});
