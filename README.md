# BetaQuill

Waiting page for collecting BetaQuill emails.

## Development

```bash
npm install
npm run dev
```

The Vite dev server uses the local `localStorage` fallback. Use `vercel dev`
when you want to exercise the Resend API route locally.

## Resend Waitlist

Production posts to `/api/waitlist` by default. Configure these environment
variables on Vercel:

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=BetaQuill <hello@your-domain.com>
RESEND_REPLY_TO=
RESEND_WAITLIST_SEGMENT_ID=seg_xxxxxxxxx
```

The API route creates the Resend contact and adds it to the BetaQuill waitlist
segment, then sends a confirmation email.
# betamanuscript
# betamanuscript
