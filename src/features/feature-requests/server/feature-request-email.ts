import "server-only";

import { Resend } from "resend";

type FeatureRequestEmail = {
  authorEmail: string;
  authorName: string;
  idempotencyKey: string;
  manuscriptTitle: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function featureRequestHtml({
  authorEmail,
  authorName,
  manuscriptTitle,
  message,
}: FeatureRequestEmail) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New BetaManuscript feature request</title>
  </head>
  <body style="margin:0;padding:40px;background:#f5f0e8;color:#1c1812;font-family:Inter,Arial,sans-serif;">
    <main style="max-width:600px;margin:0 auto;background:#fdf8f2;padding:32px;">
      <p style="margin:0 0 10px;color:#6b6456;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">Product feedback</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;font-weight:500;line-height:1.2;">New feature request</h1>
      <dl style="margin:0 0 24px;font-size:14px;line-height:1.6;">
        <dt style="color:#6b6456;">From</dt>
        <dd style="margin:0 0 12px;">${escapeHtml(authorName)} · ${escapeHtml(authorEmail)}</dd>
        <dt style="color:#6b6456;">Manuscript</dt>
        <dd style="margin:0;">${escapeHtml(manuscriptTitle)}</dd>
      </dl>
      <section aria-label="Feature request" style="border-left:2px solid #8b7355;padding:4px 0 4px 16px;font-size:16px;line-height:1.65;color:#4a4035;">
        ${safeMessage}
      </section>
    </main>
  </body>
</html>`;
}

function featureRequestText({
  authorEmail,
  authorName,
  manuscriptTitle,
  message,
}: FeatureRequestEmail) {
  return [
    "New BetaManuscript feature request",
    "",
    `From: ${authorName} <${authorEmail}>`,
    `Manuscript: ${manuscriptTitle}`,
    "",
    message,
  ].join("\n");
}

export async function sendFeatureRequestEmail(input: FeatureRequestEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const recipient = process.env.FEATURE_REQUESTS_TO || process.env.RESEND_REPLY_TO;

  if (!apiKey || !from || !recipient) {
    throw new Error("Feature request email is not configured.");
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: [recipient],
      subject: `Feature request from ${input.authorName}`,
      html: featureRequestHtml(input),
      text: featureRequestText(input),
      replyTo: input.authorEmail || undefined,
      tags: [{ name: "source", value: "feature-request" }],
    },
    { idempotencyKey: input.idempotencyKey },
  );

  if (error) {
    throw new Error(error.message || "The feature request email could not be sent.");
  }

  return data;
}
