"use client";

import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { authorPricing } from "@/shared/config/pricing";
import { Heading } from "@/shared/ui/Heading";
import { SupportEmailLink } from "@/shared/ui/SupportEmailLink";
import { Footer } from "@/views/waitlist/components/Footer";
import { Nav } from "@/views/waitlist/components/Nav";
import {
  BODY,
  CARD,
  FOREST,
  INK,
  INVERSE_BACKGROUND,
  INVERSE_FOREGROUND,
  MONO,
  MUTED,
  OXBLOOD,
  OXBLOOD_TEXT,
  PAPER,
  SANS,
  SERIF,
} from "@/shared/config/design-tokens";

type BillingCycle = "monthly" | "yearly";
type FeatureValue = boolean | string;

const freeFeatures = [
  "1 active manuscript",
  "Up to 5 beta readers",
  "Default annotation tags",
  "Revision dashboard",
  "Reader reading list",
  "2 surveys",
  "Email reader invitations",
  "Shareable reading pages",
];

const authorFeatures = [
  "Unlimited manuscripts",
  "Unlimited beta readers",
  "Custom annotation tags",
  "Unlimited surveys",
  "Shareable reading pages",
];

const comparisonRows: Array<{
  feature: string;
  free: FeatureValue;
  author: FeatureValue;
}> = [
  { feature: "Active manuscripts", free: "1", author: "Unlimited" },
  { feature: "Beta readers per manuscript", free: "5", author: "Unlimited" },
  { feature: "Annotation tags", free: "Default tags", author: "Custom tags" },
  { feature: "Revision dashboard", free: true, author: true },
  { feature: "Reader reading list", free: true, author: true },
  { feature: "Surveys", free: "2", author: "Unlimited" },
  { feature: "Free for readers", free: "Yes", author: "Yes" },
  { feature: "Email reader invitations", free: true, author: true },
  { feature: "Shareable reading pages", free: true, author: true },
];

const faqs = [
  {
    question: "Will AI write, rewrite, or shape my manuscript?",
    answer:
      "No. BetaManuscript organizes feedback from human beta readers. It does not generate ideas, rewrite your chapters, or produce critiques of your manuscript. You make the creative decisions; reader reactions help you decide what to revise.",
  },
  {
    question: "Do my beta readers need to pay?",
    answer:
      "No. Your plan covers the workspace. Readers can use private invitations or shareable reading pages without paying. A private invitation uses a free account with the invited email address; a shareable page only needs an account when the reader saves feedback.",
  },
  {
    question: "Can I share a manuscript without inviting every reader?",
    answer:
      "Yes. Enable a shareable reading page for a reading round and anyone with the link can read it without an account. Feedback still requires a free account; on Free, a reader slot is only used when feedback is first saved.",
  },
  {
    question: "What happens to my manuscripts if I downgrade to Free?",
    answer:
      "Nothing is deleted. You can choose one manuscript to keep active on Free; the rest remain safely stored until you upgrade again.",
  },
  {
    question: "Is my manuscript data private?",
    answer:
      "By default, your manuscript is available only through private invitations. You can choose to enable a shareable reading page for a specific reading round; anyone with that link can read it, and you can disable the page again from Readers.",
  },
];

const authorSignupHref = "/signup?next=%2Fdashboard%2Fsettings%3Fsection%3Dplan";

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isYearly = billingCycle === "yearly";
  const authorPrice = isYearly
    ? authorPricing.yearly.monthlyEquivalent
    : authorPricing.monthly.price;
  const authorCta = isYearly
    ? `Get started — ${authorPricing.yearly.price}/year`
    : `Get started — ${authorPricing.monthly.price}/month`;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      <Nav />

      <main>
        <section className="px-6 pb-12 pt-20 text-center sm:pt-28 md:px-12">
          <div className="mx-auto max-w-3xl">
            <Heading level={1} className="text-balance">
              Make every reader note <em>count.</em>
            </Heading>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 sm:text-lg" style={{ color: BODY }}>
              Start free with private invitations and shareable reading pages, then upgrade when you need more manuscripts, readers, surveys, or custom annotation tags.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex border" style={{ borderColor: "hsl(var(--ink) / 0.2)" }} role="group" aria-label="Billing cycle">
                {(["monthly", "yearly"] as const).map((cycle) => {
                  const active = billingCycle === cycle;
                  return (
                    <button
                      key={cycle}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setBillingCycle(cycle)}
                      className="px-5 py-2.5 text-[10px] uppercase tracking-[0.08em] transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      style={{ background: active ? INK : "transparent", color: active ? PAPER : MUTED, fontFamily: MONO }}
                    >
                      {cycle}
                    </button>
                  );
                })}
              </div>
              <span className="border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em]" style={{ borderColor: "hsl(var(--forest) / 0.16)", background: "hsl(var(--forest) / 0.08)", color: FOREST, fontFamily: MONO }}>
                Save {authorPricing.yearly.savingsPercentage}% yearly
              </span>
            </div>
          </div>
        </section>

        <section id="plans" className="scroll-mt-24 px-6 pb-24 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="mb-6 flex items-center gap-3 border px-5 py-3 text-left text-[11px] leading-5 sm:text-xs" style={{ borderColor: "hsl(var(--forest) / 0.2)", color: FOREST, fontFamily: MONO }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: FOREST }} />
              {isYearly
                ? `Yearly plan active — ${authorPricing.yearly.monthlyEquivalent}/month equivalent, billed ${authorPricing.yearly.price}/year`
                : `Monthly plan active — switch to yearly and save ${authorPricing.yearly.savings} each year`}
            </p>

            <div className="grid border sm:grid-cols-2" style={{ borderColor: "hsl(var(--ink) / 0.18)" }}>
              <article className="flex min-w-0 flex-col px-6 py-8 sm:px-9 sm:py-10" style={{ background: CARD }}>
                <PlanEyebrow>Free</PlanEyebrow>
                <div className="mt-4 flex items-end gap-2">
                  <span className="leading-none tracking-[-0.04em]" style={{ fontFamily: SERIF, fontSize: "4.5rem" }}>$0</span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.11em]" style={{ fontFamily: MONO, color: MUTED }}>
                  Forever free · no credit card required
                </p>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex min-h-12 items-center justify-center border px-5 text-sm font-medium transition-colors hover:bg-foreground/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  style={{ borderColor: "hsl(var(--ink) / 0.26)", color: INK }}
                >
                  Start for free
                </Link>
                <FeatureList features={freeFeatures} color={INK} />
                <p className="mt-auto border-t pt-5 text-xs leading-5" style={{ borderColor: "hsl(var(--ink) / 0.12)", color: MUTED }}>
                  Free plan is permanent — we don&apos;t downgrade you after a trial period.
                </p>
              </article>

              <article className="relative flex min-w-0 flex-col border-t px-6 py-8 sm:border-l sm:border-t-0 sm:px-9 sm:py-10" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.18)", background: INVERSE_BACKGROUND }}>
                <span className="absolute right-0 top-0 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em]" style={{ background: OXBLOOD, color: INVERSE_FOREGROUND, fontFamily: MONO }}>
                  Most popular
                </span>
                <PlanEyebrow color={INVERSE_FOREGROUND}>Author</PlanEyebrow>
                <div className="mt-4 flex items-end gap-2">
                  <span className="leading-none tracking-[-0.04em]" style={{ color: INVERSE_FOREGROUND, fontFamily: SERIF, fontSize: "4.5rem" }}>{authorPrice}</span>
                  <span className="mb-1.5 text-sm" style={{ color: INVERSE_FOREGROUND }}>/ month</span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.11em]" style={{ color: INVERSE_FOREGROUND, fontFamily: MONO }}>
                  {isYearly
                    ? `Billed ${authorPricing.yearly.price}/year · save ${authorPricing.yearly.savings} vs monthly`
                    : "Billed monthly · switch anytime"}
                </p>
                <Link
                  href={authorSignupHref}
                  className="mt-8 inline-flex min-h-12 items-center justify-center border px-5 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e8]"
                  style={{ borderColor: OXBLOOD, background: OXBLOOD, color: INVERSE_FOREGROUND }}
                >
                  {authorCta}
                </Link>
                <FeatureList features={authorFeatures} color={INVERSE_FOREGROUND} dark />
                <p className="mt-auto border-t pt-5 text-xs leading-5" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.18)", color: INVERSE_FOREGROUND }}>
                  Cancel anytime from your plan settings.
                </p>
              </article>
            </div>

            <section className="mt-20">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-7" style={{ background: "hsl(var(--ink) / 0.2)" }} />
                <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: MUTED, fontFamily: MONO }}>Compare plans</p>
              </div>
              <div className="overflow-x-auto border" style={{ borderColor: "hsl(var(--ink) / 0.16)" }}>
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr style={{ background: WARM_BACKGROUND }}>
                      <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Feature</th>
                      <th className="w-[20%] px-5 py-4 text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Free</th>
                      <th className="w-[20%] px-5 py-4 text-[10px] font-medium uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Author</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, index) => (
                      <tr key={row.feature} style={{ background: index % 2 === 0 ? "hsl(var(--warm) / 0.38)" : "transparent" }}>
                        <th scope="row" className="border-t px-5 py-4 text-sm font-normal" style={{ borderColor: "hsl(var(--ink) / 0.09)", color: BODY }}>{row.feature}</th>
                        <td className="border-t px-5 py-4 text-sm" style={{ borderColor: "hsl(var(--ink) / 0.09)" }}><FeatureValue value={row.free} /></td>
                        <td className="border-t px-5 py-4 text-sm" style={{ borderColor: "hsl(var(--ink) / 0.09)" }}><FeatureValue value={row.author} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>

        <section className="border-y px-6 py-20 md:px-12" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: CARD }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-7" style={{ background: "hsl(var(--ink) / 0.2)" }} />
                <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: MUTED, fontFamily: MONO }}>Frequently asked</p>
              </div>
              <Heading level={2} size="display" className="max-w-md text-balance">
                Questions authors ask <em>before subscribing.</em>
              </Heading>
            </div>

            <div className="border-t" style={{ borderColor: "hsl(var(--ink) / 0.16)" }}>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const answerId = `pricing-faq-${index}`;
                return (
                  <div key={faq.question} className="border-b" style={{ borderColor: "hsl(var(--ink) / 0.13)" }}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#7b1d1d]"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <Minus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" /> : <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
                    </button>
                    <div id={answerId} hidden={!isOpen} className="pb-6 pr-9 text-sm leading-6" style={{ color: BODY }}>
                      {faq.answer}
                    </div>
                  </div>
                );
              })}
              <p className="mt-7 text-sm" style={{ color: BODY }}>
                Still have questions?{" "}
                <SupportEmailLink
                  className="underline decoration-1 underline-offset-4 transition-opacity hover:opacity-65"
                  style={{ color: OXBLOOD_TEXT }}
                >
                  Email support
                </SupportEmailLink>
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 text-center md:px-12 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <Heading level={2} size="display" className="text-balance">
              Start free. <em>Upgrade when you&apos;re ready.</em>
            </Heading>
            <p className="mt-5 text-base" style={{ color: BODY }}>
              No credit card required to start. Cancel anytime.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex min-h-12 items-center justify-center border px-6 text-sm font-medium transition-colors hover:opacity-92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" style={{ borderColor: OXBLOOD, background: OXBLOOD, color: INVERSE_FOREGROUND }}>
                Start for free
              </Link>
              <a href="#plans" className="inline-flex min-h-12 items-center justify-center border px-6 text-sm font-medium transition-colors hover:bg-foreground/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" style={{ borderColor: "hsl(var(--ink) / 0.22)", color: INK }}>
                View Author plan
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const WARM_BACKGROUND = "hsl(var(--warm) / 0.65)";

function PlanEyebrow({ children, color = MUTED }: { children: ReactNode; color?: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.19em]" style={{ color, fontFamily: MONO }}>
      {children}
    </p>
  );
}

function FeatureList({ features, color, dark = false }: { features: string[]; color: string; dark?: boolean }) {
  return (
    <ul className="my-9 space-y-3.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-sm leading-5" style={{ color: dark ? INVERSE_FOREGROUND : BODY }}>
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} style={{ color }} aria-hidden="true" />
          {feature}
        </li>
      ))}
    </ul>
  );
}

function FeatureValue({ value }: { value: FeatureValue }) {
  if (typeof value === "string") {
    return <span style={{ color: BODY }}>{value}</span>;
  }

  if (value) {
    return <Check className="h-4 w-4" style={{ color: FOREST }} strokeWidth={2} aria-label="Included" />;
  }

  return <Minus className="h-4 w-4" style={{ color: "hsl(var(--muted-foreground) / 0.86)" }} strokeWidth={1.5} aria-label="Not included" />;
}
