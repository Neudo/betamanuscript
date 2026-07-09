import type { IncomingMessage, ServerResponse } from "node:http";
import { Resend } from "resend";

type ApiRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
};

type WaitlistPayload = {
  email?: unknown;
  source?: unknown;
  submittedAt?: unknown;
  formStartedAt?: unknown;
  website?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const confirmationSubject = "You're on the BetaManuscript waitlist";
const minimumSubmitTimeMs = 900;

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

async function readPayload(request: ApiRequest): Promise<WaitlistPayload> {
  if (request.body && typeof request.body === "object") {
    return request.body as WaitlistPayload;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body) as WaitlistPayload;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as WaitlistPayload;
}

function errorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  return undefined;
}

function errorMessage(error: unknown) {
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return "";
  }

  return String(error.message);
}

function errorName(error: unknown) {
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return undefined;
  }

  return String(error.name);
}

function resendErrorDetail(error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return {};
  }

  return {
    detail: {
      name: errorName(error),
      statusCode: errorStatus(error),
      message: errorMessage(error) || "Unknown Resend error",
    },
  };
}

function isDuplicateContactError(error: unknown) {
  const status = errorStatus(error);
  const message = errorMessage(error);

  return status === 409 || /already exists|duplicate|exists/i.test(message);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

function confirmationHtml(email: string) {
  const safeEmail = escapeHtml(email);

  return `
    <div style="margin:0;padding:0;background:#F5F0E8;color:#1C1812;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
        <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.1;color:#1C1812;">
          You're on the BetaManuscript waitlist.
        </p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#4A4035;">
          Thanks for joining. We'll write when BetaManuscript is ready and send your waitlist-only launch discount code.
        </p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#4A4035;">
          If one part of your beta reading workflow feels painfully manual, reply and tell us what it is. We read every note.
        </p>
        <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:#6B6456;">
          Registered email: ${safeEmail}
        </p>
        <div style="height:1px;background:rgba(28,24,18,0.12);margin:0 0 20px;"></div>
        <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8B7355;">
          BetaManuscript early access · launch discount reserved
        </p>
      </div>
    </div>
  `;
}

function confirmationText(email: string) {
  return `You're on the BetaManuscript waitlist.

Thanks for joining. We'll write when BetaManuscript is ready and send your waitlist-only launch discount code. No spam.

If one part of your beta reading workflow feels painfully manual, reply and tell us what it is. We read every note.

Registered email: ${email}

BetaManuscript early access`;
}

export default async function handler(
  request: ApiRequest,
  response: ServerResponse,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  let payload: WaitlistPayload;

  try {
    payload = await readPayload(request);
  } catch {
    sendJson(response, 400, { ok: false, error: "Invalid JSON payload" });
    return;
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!emailPattern.test(email)) {
    sendJson(response, 400, { ok: false, error: "Invalid email" });
    return;
  }

  if (isLikelyBot(payload)) {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    sendJson(response, 500, {
      ok: false,
      error: "RESEND_API_KEY is not configured",
    });
    return;
  }

  if (!process.env.RESEND_FROM) {
    sendJson(response, 500, {
      ok: false,
      error: "RESEND_FROM is not configured",
    });
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID;

  try {
    const { error: createError } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (createError && !isDuplicateContactError(createError)) {
      console.error("Resend contact creation failed", createError);
      sendJson(response, 502, {
        ok: false,
        error: "Could not create contact",
        ...resendErrorDetail(createError),
      });
      return;
    }

    if (segmentId) {
      const { error: segmentError } = await resend.contacts.segments.add({
        email,
        segmentId,
      });

      if (segmentError && !isDuplicateContactError(segmentError)) {
        console.error("Resend segment add failed", segmentError);
        sendJson(response, 502, {
          ok: false,
          error: "Could not add contact to waitlist segment",
          ...resendErrorDetail(segmentError),
        });
        return;
      }
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: [email],
      subject: confirmationSubject,
      html: confirmationHtml(email),
      text: confirmationText(email),
      replyTo: process.env.RESEND_REPLY_TO || undefined,
      tags: [{ name: "source", value: "waitlist" }],
    });

    if (emailError) {
      console.error("Resend confirmation email failed", emailError);
      sendJson(response, 502, {
        ok: false,
        error: "Contact saved, but confirmation email failed",
        ...resendErrorDetail(emailError),
      });
      return;
    }
  } catch (error) {
    console.error("Resend request failed", error);
    sendJson(response, 502, {
      ok: false,
      error: "Could not reach Resend",
      ...resendErrorDetail(error),
    });
    return;
  }

  sendJson(response, 200, { ok: true });
}
