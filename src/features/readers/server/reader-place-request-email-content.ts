export type ReaderPlaceRequestEmailContentInput = {
  dashboardUrl: string;
  manuscriptTitle: string;
  pendingRequestCount: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function requestNoun(count: number) {
  return count === 1 ? "request" : "requests";
}

export function createReaderPlaceRequestEmailContent(input: ReaderPlaceRequestEmailContentInput) {
  const count = Math.max(1, input.pendingRequestCount);
  const title = escapeHtml(input.manuscriptTitle);
  const actionUrl = escapeHtml(input.dashboardUrl);
  const subject = `${count} reader ${requestNoun(count)} ${count === 1 ? "needs" : "need"} your decision`;

  return {
    html: `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reader place request</title>
  </head>
  <body style="margin:0;padding:48px;background:#f5f0e8;max-width:600px;margin-left:auto;margin-right:auto;color:#1c1812;font-family:Inter,Arial,sans-serif;">
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:30px;font-weight:500;line-height:1.15;">${subject}.</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#4a4035;">Your reading round for <strong>${title}</strong> is full. A reader has asked you to release a place or accept them directly.</p>
    <p style="margin:0 0 28px;"><a href="${actionUrl}" style="display:inline-block;background:#7c1d1d;color:#fdf8f2;padding:13px 18px;text-decoration:none;font-size:14px;font-weight:600;">Review reader requests</a></p>
    <p style="margin:0;color:#6b6456;font-size:13px;line-height:1.6;">This alert is sent when a reader asks for the next available place in your reading round.</p>
  </body>
</html>`,
    subject,
    text: [
      `${subject}.`,
      "",
      `Your reading round for ${input.manuscriptTitle} is full. A reader has asked you to release a place or accept them directly.`,
      "",
      `Review reader requests: ${input.dashboardUrl}`,
    ].join("\n"),
  };
}
