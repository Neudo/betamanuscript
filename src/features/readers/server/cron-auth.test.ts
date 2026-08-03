import { describe, expect, it } from "vitest";

import { isCronRequestAuthorized } from "./cron-auth";

describe("reader-place-request cron authorization", () => {
  const secret = "a-long-random-test-secret";

  it("rejects a request when the secret is not configured", () => {
    expect(isCronRequestAuthorized(new Request("https://app.example.com"), undefined)).toBe(false);
  });

  it("rejects a request with no authorization header", () => {
    expect(isCronRequestAuthorized(new Request("https://app.example.com"), secret)).toBe(false);
  });

  it("rejects a wrong bearer token", () => {
    expect(isCronRequestAuthorized(new Request("https://app.example.com", {
      headers: { authorization: "Bearer wrong-secret" },
    }), secret)).toBe(false);
  });

  it("rejects a same-length bearer token with one changed character", () => {
    expect(isCronRequestAuthorized(new Request("https://app.example.com", {
      headers: { authorization: `Bearer ${secret.slice(0, -1)}x` },
    }), secret)).toBe(false);
  });

  it("rejects an authorization value with the wrong scheme", () => {
    expect(isCronRequestAuthorized(new Request("https://app.example.com", {
      headers: { authorization: secret },
    }), secret)).toBe(false);
  });

  it("accepts Vercel's expected bearer authorization", () => {
    expect(isCronRequestAuthorized(new Request("https://app.example.com", {
      headers: { authorization: `Bearer ${secret}` },
    }), secret)).toBe(true);
  });
});
