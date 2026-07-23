import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { DM_Mono, EB_Garamond, Inter } from "next/font/google";
import "../index.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "BetaManuscript",
  description:
    "A workspace for authors to turn beta reader feedback into revision priorities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${ebGaramond.variable} ${dmMono.variable}`}
    >
      <head>
        <meta name="google-site-verification" content="4CJoR1L_QByu5LWxKrQldEOgOaEjDBvhH7zA1W4CZKQ" />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
