import type { WaitlistPayload } from "../types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseWaitlistEmail(payload: WaitlistPayload) {
  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!emailPattern.test(email)) {
    return null;
  }

  return email;
}

export { parseWaitlistEmail };
