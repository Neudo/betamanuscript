import { describe, expect, it } from "vitest";

import { createSharedManuscriptMetadata } from "./seo";

describe("createSharedManuscriptMetadata", () => {
  it("uses the manuscript title and logline while preserving no-index directives", () => {
    expect(createSharedManuscriptMetadata({
      logline: "  A found family faces an impossible winter.  ",
      title: "  The Long Winter  ",
    })).toMatchObject({
      description: "A found family faces an impossible winter.",
      robots: {
        follow: false,
        index: false,
      },
      title: "The Long Winter | BetaManuscript",
    });
  });

  it("uses a concise fallback description when no logline is available", () => {
    expect(createSharedManuscriptMetadata({
      logline: null,
      title: "The Long Winter",
    }).description).toBe("Read The Long Winter on BetaManuscript.");
  });
});
