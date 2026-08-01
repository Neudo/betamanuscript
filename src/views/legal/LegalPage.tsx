import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { BODY, INK, MONO, MUTED, OXBLOOD_TEXT, PAPER, SANS } from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import { Footer } from "@/views/waitlist/components/Footer";

type LegalPageProps = {
  children: ReactNode;
  eyebrow: string;
  lastUpdated: string;
  summary: string;
  title: string;
};

export function LegalPage({ children, eyebrow, lastUpdated, summary, title }: LegalPageProps) {
  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      <header className="border-b px-6 py-4 md:px-12" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLogo href="/" imageClassName="h-7" />
          <Link
            href="/"
            className="text-xs font-medium transition-colors hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            style={{ color: BODY }}
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="px-6 py-14 sm:py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.22em]" style={{ color: OXBLOOD_TEXT, fontFamily: MONO }}>{eyebrow}</p>
          <Heading level={1} className="mt-4 text-balance">{title}</Heading>
          <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: BODY }}>{summary}</p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Last updated {lastUpdated}</p>

          <article className="mt-14 space-y-12 border-t pt-12" style={{ borderColor: "hsl(var(--ink) / 0.13)" }}>
            {children}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <Heading level={2} size="page">{title}</Heading>
      <div className="mt-4 space-y-4 text-[15px] leading-7" style={{ color: BODY }}>{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-primary-text">{children}</ul>;
}
