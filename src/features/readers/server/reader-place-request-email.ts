import "server-only";

import { Resend } from "resend";

import { createReaderPlaceRequestEmailContent } from "@/features/readers/server/reader-place-request-email-content";

type ReaderPlaceRequestEmail = {
  dashboardUrl: string;
  idempotencyKey: string;
  manuscriptTitle: string;
  pendingRequestCount: number;
  recipientEmail: string;
};

export async function sendReaderPlaceRequestEmail(input: ReaderPlaceRequestEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    throw new Error("Transactional email is not configured.");
  }

  const content = createReaderPlaceRequestEmailContent(input);
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: [input.recipientEmail],
      subject: content.subject,
      html: content.html,
      text: content.text,
      replyTo: process.env.RESEND_REPLY_TO || undefined,
      tags: [{ name: "source", value: "reader-place-request" }],
    },
    { idempotencyKey: input.idempotencyKey },
  );

  if (error) {
    throw new Error(error.message || "The reader-place-request email could not be sent.");
  }

  return data;
}
