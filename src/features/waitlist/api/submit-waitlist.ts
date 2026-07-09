import type {
  WaitlistPayload,
  WaitlistResponseBody,
} from "../types";

export async function submitWaitlist(payload: WaitlistPayload) {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | WaitlistResponseBody
    | null;

  if (!response.ok) {
    const errorMessage =
      process.env.NODE_ENV === "development" && body?.detail?.message
        ? `${body.error}: ${body.detail.message}`
        : body?.error;

    throw new Error(errorMessage ?? "Waitlist endpoint rejected the request");
  }

  return body ?? { ok: true };
}
