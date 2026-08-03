import { describe, expect, it } from "vitest";

import { createReaderPlaceRequestEmailContent } from "./reader-place-request-email-content";

const input = {
  dashboardUrl: "https://app.example.com/dashboard/readers",
  manuscriptTitle: "The Last Draft",
  pendingRequestCount: 1,
};

describe("reader-place-request email content", () => {
  it("uses singular copy for one pending request", () => {
    expect(createReaderPlaceRequestEmailContent(input).subject).toBe("1 reader request needs your decision");
  });

  it("uses plural copy for grouped requests", () => {
    expect(createReaderPlaceRequestEmailContent({ ...input, pendingRequestCount: 3 }).subject)
      .toBe("3 reader requests need your decision");
  });

  it("normalizes an unexpected zero count to a safe singular notification", () => {
    expect(createReaderPlaceRequestEmailContent({ ...input, pendingRequestCount: 0 }).subject)
      .toBe("1 reader request needs your decision");
  });

  it("includes the exact dashboard destination in the plain-text fallback", () => {
    expect(createReaderPlaceRequestEmailContent(input).text)
      .toContain("Review reader requests: https://app.example.com/dashboard/readers");
  });

  it("describes the immediate reader-place alert without the former batch delay", () => {
    const content = createReaderPlaceRequestEmailContent(input);

    expect(content.html).toContain("This alert is sent when a reader asks for the next available place");
    expect(content.html).not.toContain("six hours");
  });

  it("escapes author-controlled manuscript titles in HTML", () => {
    expect(createReaderPlaceRequestEmailContent({ ...input, manuscriptTitle: "<draft & final>" }).html)
      .toContain("&lt;draft &amp; final&gt;");
  });

  it("does not leave raw markup in the email subject", () => {
    expect(createReaderPlaceRequestEmailContent({ ...input, manuscriptTitle: "<draft>" }).subject)
      .not.toContain("<draft>");
  });
});
