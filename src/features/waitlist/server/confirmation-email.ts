const confirmationSubject = "You're on the BetaQuill waitlist";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function confirmationHtml(email: string) {
  const safeEmail = escapeHtml(email);

  return `
    <div style="margin:0;padding:0;background:#F5F0E8;color:#1C1812;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
        <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.1;color:#1C1812;">
          You're on the BetaQuill waitlist.
        </p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#4A4035;">
          Thanks for joining. We'll write when BetaQuill is ready and send your waitlist-only launch discount code.
        </p>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#4A4035;">
          If one part of your beta reading workflow feels painfully manual, reply and tell us what it is. We read every note.
        </p>
        <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:#6B6456;">
          Registered email: ${safeEmail}
        </p>
        <div style="height:1px;background:rgba(28,24,18,0.12);margin:0 0 20px;"></div>
        <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8B7355;">
          BetaQuill early access · launch discount reserved
        </p>
      </div>
    </div>
  `;
}

function confirmationText(email: string) {
  return `You're on the BetaQuill waitlist.

Thanks for joining. We'll write when BetaQuill is ready and send your waitlist-only launch discount code. No spam.

If one part of your beta reading workflow feels painfully manual, reply and tell us what it is. We read every note.

Registered email: ${email}

BetaQuill early access`;
}

export { confirmationHtml, confirmationSubject, confirmationText };
