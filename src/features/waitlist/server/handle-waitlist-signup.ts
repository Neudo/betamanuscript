import { Resend } from "resend";
import type { WaitlistPayload, WaitlistResponseBody } from "../types";
import { parseWaitlistEmail } from "../schemas/waitlist.schema";
import { isLikelyBot } from "./anti-bot";
import {
  confirmationHtml,
  confirmationSubject,
  confirmationText,
} from "./confirmation-email";
import { isDuplicateContactError, resendErrorDetail } from "./resend-errors";

type WaitlistResult = {
  status: number;
  body: WaitlistResponseBody;
};

async function handleWaitlistSignup(
  payload: WaitlistPayload,
): Promise<WaitlistResult> {
  const email = parseWaitlistEmail(payload);

  if (!email) {
    return { status: 400, body: { ok: false, error: "Invalid email" } };
  }

  if (isLikelyBot(payload)) {
    return { status: 200, body: { ok: true } };
  }

  if (!process.env.RESEND_API_KEY) {
    return {
      status: 500,
      body: { ok: false, error: "RESEND_API_KEY is not configured" },
    };
  }

  if (!process.env.RESEND_FROM) {
    return {
      status: 500,
      body: { ok: false, error: "RESEND_FROM is not configured" },
    };
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
      return {
        status: 502,
        body: {
          ok: false,
          error: "Could not create contact",
          ...resendErrorDetail(createError),
        },
      };
    }

    if (segmentId) {
      const { error: segmentError } = await resend.contacts.segments.add({
        email,
        segmentId,
      });

      if (segmentError && !isDuplicateContactError(segmentError)) {
        console.error("Resend segment add failed", segmentError);
        return {
          status: 502,
          body: {
            ok: false,
            error: "Could not add contact to waitlist segment",
            ...resendErrorDetail(segmentError),
          },
        };
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
      return {
        status: 502,
        body: {
          ok: false,
          error: "Contact saved, but confirmation email failed",
          ...resendErrorDetail(emailError),
        },
      };
    }
  } catch (error) {
    console.error("Resend request failed", error);
    return {
      status: 502,
      body: {
        ok: false,
        error: "Could not reach Resend",
        ...resendErrorDetail(error),
      },
    };
  }

  return { status: 200, body: { ok: true } };
}

export { handleWaitlistSignup };
