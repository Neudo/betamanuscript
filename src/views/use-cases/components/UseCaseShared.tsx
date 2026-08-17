import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  BODY,
  CARD,
  EDITORIAL_DARK,
  INK,
  INVERSE_FOREGROUND,
  MONO,
  MUTED,
  OXBLOOD,
  PAPER,
  SANS,
  WARM,
} from "@/shared/config/design-tokens";
import { site } from "@/shared/config/site";
import { Heading } from "@/shared/ui/Heading";
import { Footer } from "@/views/waitlist/components/Footer";
import { Nav } from "@/views/waitlist/components/Nav";

type BreadcrumbItem = {
  href: string;
  label: string;
};

export { Breadcrumbs } from "@/shared/ui/Breadcrumbs";

type HeroAction = {
  href: string;
  label: string;
  primary?: boolean;
};

export function UseCasePageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      <Nav />
      {children}
      <Footer />
    </div>
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: new URL(item.href, site.url).toString(),
      name: item.label,
      position: index + 1,
    })),
  }).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />;
}

export function UseCaseHero({
  actions,
  children,
  title,
}: {
  actions: HeroAction[];
  children: ReactNode;
  title: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b px-6 pb-20 pt-8 md:px-12 md:pb-28 md:pt-10" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{ backgroundImage: "radial-gradient(circle at 86% 12%, hsl(var(--oxblood) / 0.12), transparent 23rem), radial-gradient(circle at 4% 96%, hsl(var(--forest) / 0.1), transparent 25rem)" }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <Heading level={1} className="max-w-3xl text-balance">
            {title}
          </Heading>
          <div className="mt-7 max-w-2xl text-pretty text-base leading-8 sm:text-lg" style={{ color: BODY }}>
            {children}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={action.primary
                  ? "inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  : "inline-flex min-h-11 items-center gap-1.5 text-sm underline decoration-1 underline-offset-4 transition-opacity hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"}
                style={action.primary ? { background: OXBLOOD, borderColor: OXBLOOD, color: INVERSE_FOREGROUND } : { color: INK }}
              >
                {action.label}
                {action.primary ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ScreenshotPlaceholder({ children, label }: { children?: ReactNode; label: string }) {
  return (
    <aside className="overflow-hidden border shadow-[0_22px_50px_hsl(var(--ink)/0.1)]" aria-label={`${label} product screenshot placeholder`} style={{ background: CARD, borderColor: "hsl(var(--ink) / 0.16)" }}>
      <div className="border-b px-4 py-3 text-right text-[8px] uppercase tracking-[0.14em] sm:px-5" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: PAPER, color: MUTED, fontFamily: MONO }}>
        Screenshot placeholder
      </div>
      <div className="p-4 sm:p-5">{children ?? <p className="text-sm leading-6" style={{ color: BODY }}>{label}</p>}</div>
      <p className="border-t px-4 py-3 text-[9px] leading-4" style={{ borderColor: "hsl(var(--ink) / 0.1)", color: MUTED, fontFamily: MONO }}>
        Illustrative layout — replace with a product capture before launch.
      </p>
    </aside>
  );
}

export function FaqList({ items }: { items: Array<{ answer: ReactNode; question: string }> }) {
  return (
    <div className="border-y" style={{ borderColor: "hsl(var(--ink) / 0.14)" }}>
      {items.map((item) => (
        <details key={item.question} className="group border-b last:border-b-0" style={{ borderColor: "hsl(var(--ink) / 0.12)" }}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-1 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-3">
            <Heading level={3} size="subsection" className="text-balance">
              {item.question}
            </Heading>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: MUTED }} aria-hidden="true" />
          </summary>
          <div className="px-1 pb-6 sm:px-3">
            <div className="max-w-3xl text-sm leading-6" style={{ color: BODY }}>{item.answer}</div>
          </div>
        </details>
      ))}
    </div>
  );
}

export function FinalCta({ children, description, title }: { children: ReactNode; description: string; title: ReactNode }) {
  return (
    <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: CARD }}>
      <div className="mx-auto max-w-4xl border px-6 py-12 text-center sm:px-12 sm:py-16" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.2)", background: EDITORIAL_DARK }}>
        <Heading level={2} tone="inverse" className="mx-auto max-w-2xl text-balance">
          {title}
        </Heading>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>{description}</p>
        <Link
          href="/signup"
          className="mt-9 inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          style={{ background: INVERSE_FOREGROUND, borderColor: INVERSE_FOREGROUND, color: EDITORIAL_DARK }}
        >
          {children}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function RelatedLinks({ items }: { items: Array<{ description: string; href: string; title: string }> }) {
  return (
    <aside className="border-y px-6 py-12 md:px-12 md:py-16" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.12)" }} aria-label="Related pages">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-48 flex-col border p-6 transition-colors duration-200 hover:bg-foreground/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-7 ${index === 1 ? "bg-[hsl(var(--paper))]" : "bg-card"}`}
              style={{ borderColor: "hsl(var(--ink) / 0.16)" }}
            >
              <ArrowRight className="absolute right-5 top-5 h-4 w-4 sm:right-6 sm:top-6" style={{ color: INK }} aria-hidden="true" />
              <p className="max-w-[15rem] pr-7 text-[1.45rem] leading-[1.1] tracking-[-0.015em]" style={{ color: INK, fontFamily: "'EB Garamond', serif" }}>
                {item.title}
              </p>
              <p className="mt-auto max-w-sm pt-8 text-sm leading-6" style={{ color: BODY }}>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
