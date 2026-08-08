import { describe, expect, it } from "vitest";

import {
  findManuscriptByReference,
  getManuscriptReference,
  getReaderManuscriptPath,
  getManuscriptUrlKeyFromReference,
  withManuscriptReference,
} from "./manuscript-url";

const manuscript = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Talina’s Work!",
  urlKey: "a1b2c3d4e5f6",
};

describe("manuscript URL references", () => {
  it("combines a readable title with a stable unique key", () => {
    expect(getManuscriptReference(manuscript)).toBe("talinas-work--a1b2c3d4e5f6");
  });

  it("uses the readable reference in reader routes", () => {
    expect(getReaderManuscriptPath(manuscript)).toBe("/reader/talinas-work--a1b2c3d4e5f6");
  });

  it("resolves both a current reference and a legacy UUID", () => {
    expect(findManuscriptByReference([manuscript], "talinas-work--a1b2c3d4e5f6"))
      .toBe(manuscript);
    expect(findManuscriptByReference([manuscript], manuscript.id)).toBe(manuscript);
  });

  it("does not accept arbitrary suffixes as manuscript keys", () => {
    expect(getManuscriptUrlKeyFromReference("talinas-work--not-a-key")).toBeNull();
  });

  it("replaces legacy query parameters with the readable reference", () => {
    const searchParams = withManuscriptReference(
      new URLSearchParams("manuscriptId=legacy-id&versionId=version-id"),
      manuscript,
    );

    expect(searchParams.toString()).toBe("versionId=version-id&manuscript=talinas-work--a1b2c3d4e5f6");
  });
});
