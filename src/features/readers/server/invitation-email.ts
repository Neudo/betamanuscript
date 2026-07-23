import "server-only";

import { Resend } from "resend";

type ReaderInvitationEmail = {
  idempotencyKey: string;
  inviteUrl: string;
  personalNote: string | null;
  recipientEmail: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function invitationHtml({ inviteUrl, personalNote }: ReaderInvitationEmail) {
  const note = personalNote?.trim();
  const safeNote = note ? escapeHtml(note).replace(/\n/g, "<br />") : null;

  return `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>You have been invited to read a manuscript</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f0e8;color:#1c1812;font-family:Inter,Arial,sans-serif;">
    <main style="max-width:560px;margin:0 auto;padding:48px 24px;">
      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:30px;font-weight:500;line-height:1.15;">You have been invited to read a manuscript.</h1>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#4a4035;">Create an account or sign in with this email address to start reading and leave feedback.</p>
      ${safeNote ? `<section aria-label="A note from the author" style="margin:0 0 24px;border-left:2px solid #8b7355;padding:12px 16px;color:#4a4035;font-size:15px;line-height:1.6;">${safeNote}</section>` : ""}
      <p style="margin:0 0 28px;"><a href="${escapeHtml(inviteUrl)}" style="display:inline-block;background:#1c1812;color:#ffffff;padding:13px 18px;text-decoration:none;font-size:14px;font-weight:600;">Open invitation</a></p>
      <p style="margin:0;color:#6b6456;font-size:13px;line-height:1.6;">This private link expires in 14 days. If you were not expecting this invitation, you can ignore this email.</p>
    </main>
  </body>
</html>`;
}

function invitationText({ inviteUrl, personalNote }: ReaderInvitationEmail) {
  return [
    "You have been invited to read a manuscript.",
    "",
    "Create an account or sign in with this email address to start reading and leave feedback.",
    personalNote?.trim() ? `\nA note from the author:\n${personalNote.trim()}` : "",
    `\nOpen invitation: ${inviteUrl}`,
    "\nThis private link expires in 14 days. If you were not expecting this invitation, you can ignore this email.",
  ].join("\n");
}

export async function sendReaderInvitationEmail(input: ReaderInvitationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    throw new Error("Transactional email is not configured.");
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: [input.recipientEmail],
      subject: "You have been invited to read a manuscript",
      html: invitationHtml(input),
      text: invitationText(input),
      replyTo: process.env.RESEND_REPLY_TO || undefined,
      tags: [{ name: "source", value: "reader-invitation" }],
    },
    { idempotencyKey: input.idempotencyKey },
  );

  if (error) {
    throw new Error(error.message || "The invitation email could not be sent.");
  }

  return data;
}
