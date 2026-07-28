"use client";

import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { authorPricing } from "@/shared/config/pricing";
import { Heading } from "@/shared/ui/Heading";
import { Footer } from "@/views/waitlist/components/Footer";
import { Nav } from "@/views/waitlist/components/Nav";
import {
  BODY,
  CARD,
  FOREST,
  INK,
  MONO,
  MUTED,
  OXBLOOD,
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
  "1 survey",
  "Shareable invite link",
];

const authorFeatures = [
  "Unlimited manuscripts",
  "Unlimited beta readers",
  "Custom annotation tags",
  "Advanced revision priorities",
  "Unlimited surveys",
  "CSV & PDF export",
  "Custom reader portal",
  "Priority support",
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
  { feature: "Surveys", free: "1", author: "Unlimited" },
  { feature: "Free for readers", free: "Yes", author: "Yes" },
  { feature: "Shareable invite link", free: true, author: true },
  { feature: "CSV & PDF export", free: false, author: true },
  { feature: "Custom reader portal", free: false, author: true },
  { feature: "Priority support", free: false, author: true },
];

const faqs = [
  {
    question: "Do my beta readers need to pay?",
    answer:
      "No. Your plan covers the workspace. Readers can open an invite, read your manuscript, and leave feedback without paying for an account.",
  },
  {
    question: "What happens to my manuscripts if I downgrade to Free?",
    answer:
      "Nothing is deleted. You can choose one manuscript to keep active on Free; the rest remain safely stored until you upgrade again.",
  },
  {
    question: "Is there a limit on manuscript or chapter length?",
    answer:
      "There is no artificial word-count limit. Keep chapters reasonably sized for a comfortable reading and annotation experience.",
  },
  {
    question: "Can I export all my feedback data?",
    answer:
      "Author includes CSV and PDF exports, so you can keep an archive of annotations, reader responses, and revision priorities outside the app.",
  },
  {
    question: "Is my manuscript data private?",
    answer:
      "Yes. Your manuscript is visible only to you and the readers you invite. We do not publish, sell, or use your writing to train public models.",
  },
  {
    question: "Are there discounts for book coaches or writing groups?",
    answer:
      "We are happy to discuss group access for coaches and writing communities. Send us a note with the size of your group and how you work.",
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
            <div className="mb-8 flex items-center justify-center gap-3" aria-label="Pricing">
              <span className="h-px w-10" style={{ background: "rgba(28,24,18,0.16)" }} />
              <span className="text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: MONO, color: MUTED }}>
                Pricing
              </span>
              <span className="h-px w-10" style={{ background: "rgba(28,24,18,0.16)" }} />
            </div>
            <Heading level={1} className="text-balance">
              Make every reader note <em>count.</em>
            </Heading>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 sm:text-lg" style={{ color: BODY }}>
              Start free and upgrade when you&apos;re ready to run serious beta rounds. No per-reader fees, no feature gating, no surprises.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex border" style={{ borderColor: "rgba(28,24,18,0.2)" }} role="group" aria-label="Billing cycle">
                {(["monthly", "yearly"] as const).map((cycle) => {
                  const active = billingCycle === cycle;
                  return (
                    <button
                      key={cycle}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setBillingCycle(cycle)}
                      className="px-5 py-2.5 text-[10px] uppercase tracking-[0.08em] transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b1d1d]"
                      style={{ background: active ? INK : "transparent", color: active ? PAPER : MUTED, fontFamily: MONO }}
                    >
                      {cycle}
                    </button>
                  );
                })}
              </div>
              <span className="border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em]" style={{ borderColor: "rgba(44,62,45,0.16)", background: "rgba(44,62,45,0.08)", color: FOREST, fontFamily: MONO }}>
                Save {authorPricing.yearly.savingsPercentage}% yearly
              </span>
            </div>
          </div>
        </section>

        <section id="plans" className="scroll-mt-24 px-6 pb-24 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="mb-6 flex items-center gap-3 border px-5 py-3 text-left text-[11px] leading-5 sm:text-xs" style={{ borderColor: "rgba(44,62,45,0.2)", color: FOREST, fontFamily: MONO }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: FOREST }} />
              {isYearly
                ? `Yearly plan active — ${authorPricing.yearly.monthlyEquivalent}/month equivalent, billed ${authorPricing.yearly.price}/year`
                : `Monthly plan active — switch to yearly and save ${authorPricing.yearly.savings} each year`}
            </p>

            <div className="grid border sm:grid-cols-2" style={{ borderColor: "rgba(28,24,18,0.18)" }}>
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
                  className="mt-8 inline-flex min-h-12 items-center justify-center border px-5 text-sm font-medium transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b1d1d]"
                  style={{ borderColor: "rgba(28,24,18,0.26)", color: INK }}
                >
                  Start for free
                </Link>
                <FeatureList features={freeFeatures} color={INK} />
                <p className="mt-auto border-t pt-5 text-xs leading-5" style={{ borderColor: "rgba(28,24,18,0.12)", color: MUTED }}>
                  Free plan is permanent — we don&apos;t downgrade you after a trial period.
                </p>
              </article>

              <article className="relative flex min-w-0 flex-col border-t px-6 py-8 sm:border-l sm:border-t-0 sm:px-9 sm:py-10" style={{ borderColor: "rgba(245,240,232,0.18)", background: INK }}>
                <span className="absolute right-0 top-0 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em]" style={{ background: OXBLOOD, color: PAPER, fontFamily: MONO }}>
                  Most popular
                </span>
                <PlanEyebrow color={PAPER}>Author</PlanEyebrow>
                <div className="mt-4 flex items-end gap-2">
                  <span className="leading-none tracking-[-0.04em]" style={{ color: PAPER, fontFamily: SERIF, fontSize: "4.5rem" }}>{authorPrice}</span>
                  <span className="mb-1.5 text-sm" style={{ color: PAPER }}>/ month</span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.11em]" style={{ color: PAPER, fontFamily: MONO }}>
                  {isYearly
                    ? `Billed ${authorPricing.yearly.price}/year · save ${authorPricing.yearly.savings} vs monthly`
                    : "Billed monthly · switch anytime"}
                </p>
                <Link
                  href={authorSignupHref}
                  className="mt-8 inline-flex min-h-12 items-center justify-center border px-5 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f0e8]"
                  style={{ borderColor: OXBLOOD, background: OXBLOOD, color: PAPER }}
                >
                  {authorCta}
                </Link>
                <FeatureList features={authorFeatures} color={PAPER} dark />
                <p className="mt-auto border-t pt-5 text-xs leading-5" style={{ borderColor: "rgba(245,240,232,0.18)", color: PAPER }}>
                  Cancel anytime from your plan settings.
                </p>
              </article>
            </div>

            <section className="mt-20">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-7" style={{ background: "rgba(28,24,18,0.2)" }} />
                <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: MUTED, fontFamily: MONO }}>Compare plans</p>
              </div>
              <div className="overflow-x-auto border" style={{ borderColor: "rgba(28,24,18,0.16)" }}>
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
                      <tr key={row.feature} style={{ background: index % 2 === 0 ? "rgba(237,232,220,0.38)" : "transparent" }}>
                        <th scope="row" className="border-t px-5 py-4 text-sm font-normal" style={{ borderColor: "rgba(28,24,18,0.09)", color: BODY }}>{row.feature}</th>
                        <td className="border-t px-5 py-4 text-sm" style={{ borderColor: "rgba(28,24,18,0.09)" }}><FeatureValue value={row.free} /></td>
                        <td className="border-t px-5 py-4 text-sm" style={{ borderColor: "rgba(28,24,18,0.09)" }}><FeatureValue value={row.author} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>

        <section className="border-y px-6 py-20 md:px-12" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-7" style={{ background: "rgba(28,24,18,0.2)" }} />
                <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: MUTED, fontFamily: MONO }}>Frequently asked</p>
              </div>
              <Heading level={2} size="display" className="max-w-md text-balance">
                Questions authors ask <em>before subscribing.</em>
              </Heading>
            </div>

            <div className="border-t" style={{ borderColor: "rgba(28,24,18,0.16)" }}>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const answerId = `pricing-faq-${index}`;
                return (
                  <div key={faq.question} className="border-b" style={{ borderColor: "rgba(28,24,18,0.13)" }}>
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
                <a className="underline decoration-1 underline-offset-4 transition-opacity hover:opacity-65" href="mailto:support@betamanuscript.com" style={{ color: OXBLOOD }}>
                  support@betamanuscript.com
                </a>
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
              <Link href="/signup" className="inline-flex min-h-12 items-center justify-center border px-6 text-sm font-medium transition-colors hover:opacity-92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b1d1d]" style={{ borderColor: OXBLOOD, background: OXBLOOD, color: PAPER }}>
                Start for free
              </Link>
              <a href="#plans" className="inline-flex min-h-12 items-center justify-center border px-6 text-sm font-medium transition-colors hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b1d1d]" style={{ borderColor: "rgba(28,24,18,0.22)", color: INK }}>
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

const WARM_BACKGROUND = "rgba(237,232,220,0.65)";

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
        <li key={feature} className="flex items-start gap-3 text-sm leading-5" style={{ color: dark ? PAPER : BODY }}>
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

  return <Minus className="h-4 w-4" style={{ color: "rgba(139,115,85,0.58)" }} strokeWidth={1.5} aria-label="Not included" />;
}
