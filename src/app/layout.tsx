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
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
