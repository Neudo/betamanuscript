import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "../index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BetaQuill",
  description:
    "A workspace for authors to turn beta reader feedback into revision priorities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="4CJoR1L_QByu5LWxKrQldEOgOaEjDBvhH7zA1W4CZKQ" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
