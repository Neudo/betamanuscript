import type { WaitlistPayload } from "../types";

const minimumSubmitTimeMs = 900;

function isLikelyBot(payload: WaitlistPayload) {
  const honeypot =
    typeof payload.website === "string" ? payload.website.trim() : "";

  if (honeypot) {
    return true;
  }

  const formStartedAt =
    typeof payload.formStartedAt === "number"
      ? payload.formStartedAt
      : Number(payload.formStartedAt);

  if (!Number.isFinite(formStartedAt)) {
    return false;
  }

  return Date.now() - formStartedAt < minimumSubmitTimeMs;
}

export { isLikelyBot };
