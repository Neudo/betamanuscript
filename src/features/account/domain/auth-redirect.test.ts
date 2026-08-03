import { describe, expect, it } from "vitest";

import {
  getPendingPublicFeedbackToken,
  getPublicReaderFeedbackPath,
} from "./auth-redirect";

const publicReaderPath = "/read/00000000-0000-4000-8000-000000000000/reading";
const feedbackToken = "abcdefghijklmnopqrstuvwxyzABCDEFG_123456789";

describe("pending public feedback redirects", () => {
  it("accepts a 256-bit base64url feedback token", () => {
    expect(feedbackToken).toHaveLength(43);
    expect(getPendingPublicFeedbackToken(feedbackToken)).toBe(feedbackToken);
  });

  it("rejects malformed feedback tokens", () => {
    expect(getPendingPublicFeedbackToken("short")).toBeNull();
    expect(getPendingPublicFeedbackToken(`${feedbackToken}=`)).toBeNull();
  });

  it("keeps the feedback token on the public reader redirect only", () => {
    expect(getPublicReaderFeedbackPath(publicReaderPath, feedbackToken))
      .toBe(`${publicReaderPath}?feedback=${feedbackToken}`);
    expect(getPublicReaderFeedbackPath(null, feedbackToken)).toBeNull();
  });
});
