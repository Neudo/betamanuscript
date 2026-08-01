import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { DM_Mono, EB_Garamond, Inter } from "next/font/google";
import "../index.css";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/shared/config/site";
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
  metadataBase: new URL(site.url),
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo-small.png", type: "image/png" },
    ],
  },
  verification: {
    google: "4CJoR1L_QByu5LWxKrQldEOgOaEjDBvhH7zA1W4CZKQ",
  },
};

const structuredData = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    logo: `${site.url}/logo-full.svg`,
    name: site.name,
    url: site.url,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    description: site.defaultDescription,
    name: site.name,
    operatingSystem: "Web",
    url: site.url,
  },
]).replace(/</g, "\\u003c");

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
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-preference" strategy="beforeInteractive">
          {`(() => {
            try {
              const theme = window.localStorage.getItem("betaquill.theme") === "dark" ? "dark" : "light";
              document.documentElement.classList.toggle("dark", theme === "dark");
              document.documentElement.dataset.theme = theme;
            } catch {
              document.documentElement.dataset.theme = "light";
            }
          })();`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        <Providers>{children}</Providers>
        <Toaster />
        <Analytics />
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
