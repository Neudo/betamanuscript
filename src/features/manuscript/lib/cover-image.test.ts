import { describe, expect, it } from "vitest";

import {
  getOptimizedCoverFilename,
  getResizedCoverImageSize,
} from "./cover-image";

describe("cover image optimization", () => {
  it("keeps an already small cover at its original dimensions", () => {
    expect(getResizedCoverImageSize(800, 1_200, 1_600)).toEqual({
      height: 1_200,
      width: 800,
    });
  });

  it("limits the longest cover edge without changing its ratio", () => {
    expect(getResizedCoverImageSize(3_000, 4_500, 1_600)).toEqual({
      height: 1_600,
      width: 1_067,
    });
  });

  it("uses a safe WebP filename", () => {
    expect(getOptimizedCoverFilename("My cover.PNG")).toBe("My cover.webp");
    expect(getOptimizedCoverFilename("cover")).toBe("cover.webp");
  });
});
