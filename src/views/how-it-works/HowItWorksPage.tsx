"use client";

import {
  ArrowRight,
  BarChart2,
  Upload,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";

import {
  BODY,
  CARD,
  FOREST,
  INK,
  INVERSE_BACKGROUND,
  INVERSE_FOREGROUND,
  INVERSE_MUTED,
  MONO,
  MUTED,
  OXBLOOD,
  OXBLOOD_TEXT,
  PAPER,
  SANS,
  SERIF,
  WARM,
  premiumEase,
} from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import { Footer } from "@/views/waitlist/components/Footer";
import { Nav } from "@/views/waitlist/components/Nav";

const steps = [
  {
    Icon: Upload,
    number: "01",
    label: "Prepare the draft",
    title: "Bring your manuscript into one clear reading space.",
    detail:
      "Add your draft chapter by chapter, so readers can move through it in order and every reaction has a precise place to live.",
    preview: "draft",
  },
  {
    Icon: Users,
    number: "02",
    label: "Invite readers",
    title: "Give each beta reader a focused way to respond.",
    detail:
      "Invite the people you trust. They read in their own workspace, keep their place, and leave feedback as the story is still fresh.",
    preview: "readers",
  },
  {
    Icon: BarChart2,
    number: "03",
    label: "Collect feedback and find the patterns",
    title: "Turn scattered reactions into revision decisions.",
    detail:
      "Review tagged notes, survey responses, and recurring issues by chapter. The patterns stay visible when it is time to decide what to revise.",
    preview: "insights",
  },
] as const;

const presentationSlides = [
  {
    label: "Manuscript",
    src: "/images/slide-manuscript.jpg",
  },
  {
    label: "Readers",
    src: "/images/slide-reader.jpg",
  },
  {
    label: "Feedback",
    src: "/images/slide-feedback.jpg",
  },
  {
    label: "Revision",
    src: "/images/slide-survey.jpg",
  },
] as const;

type StepPreviewKind = (typeof steps)[number]["preview"];

export function HowItWorksPage() {
  const reduceMotion = useReducedMotion();
  const [presentationSlider, setPresentationSlider] = useState<SwiperInstance | null>(null);
  const [activePresentation, setActivePresentation] = useState(0);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      <Nav />

      <main>
        <section className="relative isolate overflow-hidden border-b px-6 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(circle at 87% 5%, hsl(var(--oxblood) / 0.12), transparent 23rem), radial-gradient(circle at 5% 90%, hsl(var(--forest) / 0.1), transparent 25rem)",
            }}
          />
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: premiumEase }}
            >
              <Heading level={1} className="max-w-2xl text-balance">
                Run your beta reading round without the Google Docs mess.
              </Heading>
              <p className="mt-7 max-w-xl text-pretty text-base leading-8 sm:text-lg" style={{ color: BODY }}>
                BetaManuscript keeps your chapters, readers, passage-level feedback, and revision decisions together in one focused workspace.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  style={{ background: OXBLOOD, borderColor: OXBLOOD, color: INVERSE_FOREGROUND }}
                >
                  Start for free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#flow"
                  className="text-sm underline decoration-1 underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7b1d1d]"
                  style={{ color: INK }}
                >
                  See the flow
                </a>
              </div>
              <p className="mt-5 text-xs leading-5" style={{ color: MUTED }}>
                Bring your own beta readers. BetaManuscript gives them a focused place to read and gives you one place to understand their feedback.
              </p>
            </motion.div>

          </div>
        </section>

        <ProductPresentationSlider
          activeSlide={activePresentation}
          onSlideChange={setActivePresentation}
          onSliderReady={setPresentationSlider}
          reduceMotion={Boolean(reduceMotion)}
          slider={presentationSlider}
        />

        <section id="flow" className="scroll-mt-20 border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end">
              <div>
                <Heading level={2} className="max-w-md text-balance">
                  A clear workflow from manuscript to revision.
                </Heading>
              </div>
              <p className="max-w-xl text-base leading-7" style={{ color: BODY }}>
                The work moves from manuscript to reader experience to revision without losing context along the way.
              </p>
            </div>

            <ol className="mt-14 space-y-12 md:mt-16 md:space-y-16">
              {steps.map((step, index) => (
                <motion.li
                  key={step.number}
                  className="grid items-center gap-9 border-t pt-7 md:grid-cols-[minmax(0,0.86fr)_minmax(320px,0.8fr)] md:gap-16 md:pt-9 odd:md:grid-cols-[minmax(320px,0.8fr)_minmax(0,0.86fr)]"
                  style={{ borderColor: "hsl(var(--ink) / 0.16)" }}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.58, ease: premiumEase }}
                >
                  <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] tracking-[0.18em]" style={{ color: MUTED, fontFamily: MONO }}>{step.number}</span>
                      <span className="h-px w-8" style={{ background: "hsl(var(--ink) / 0.2)" }} />
                      <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: MONO }}>{step.label}</span>
                    </div>
                    <div className="mt-7 flex h-10 w-10 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.15)", background: CARD, color: OXBLOOD_TEXT }}>
                      <step.Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <Heading level={3} size="section" className="mt-7 max-w-xl text-balance">
                      {step.title}
                    </Heading>
                    <p className="mt-5 max-w-xl text-base leading-7" style={{ color: BODY }}>{step.detail}</p>
                  </div>
                  <div className={index % 2 === 1 ? "md:order-1" : undefined}>
                    <StepPreview kind={step.preview} />
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: INVERSE_BACKGROUND, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <Eyebrow inverse>From reaction to decision</Eyebrow>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">
                Review the original passage before deciding what to revise.
              </Heading>
              <p className="mt-6 max-w-lg text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
                Reader reactions remain tied to the chapter, the passage, and the theme behind them. You can move from a pattern to the original feedback without rebuilding the trail.
              </p>
            </div>
            <RevisionPathPreview />
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: CARD }}>
          <div className="mx-auto max-w-4xl border px-6 py-12 text-center sm:px-12 sm:py-16" style={{ borderColor: "hsl(var(--ink) / 0.16)", background: PAPER }}>
            <Eyebrow centered>Ready for a clearer beta round?</Eyebrow>
            <Heading level={2} className="mx-auto max-w-2xl text-balance">
              Let every reader reaction find its way into your <em>revision.</em>
            </Heading>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7" style={{ color: BODY }}>
              Start with one manuscript, invite the readers you trust, and keep their feedback organized from the first chapter onward.
            </p>
            <Link
              href="/signup"
              className="mt-9 inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              style={{ background: OXBLOOD, borderColor: OXBLOOD, color: INVERSE_FOREGROUND }}
            >
              Start for free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Eyebrow({ children, centered = false, inverse = false }: { children: React.ReactNode; centered?: boolean; inverse?: boolean }) {
  const color = inverse ? INVERSE_MUTED : MUTED;
  const lineColor = inverse ? "hsl(var(--inverse-foreground) / 0.24)" : "hsl(var(--ink) / 0.24)";

  return (
    <p className={`mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] ${centered ? "justify-center" : ""}`} style={{ color, fontFamily: MONO }}>
      <span className="h-px w-8" style={{ background: lineColor }} />
      {children}
      {centered ? <span className="h-px w-8" style={{ background: lineColor }} /> : null}
    </p>
  );
}

function ProductPresentationSlider({
  activeSlide,
  onSlideChange,
  onSliderReady,
  reduceMotion,
  slider,
}: {
  activeSlide: number;
  onSlideChange: (index: number) => void;
  onSliderReady: (slider: SwiperInstance) => void;
  reduceMotion: boolean;
  slider: SwiperInstance | null;
}) {
  return (
    <section className="hidden border-b px-6 py-10 md:block md:px-12 md:py-14" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: CARD }} aria-label="BetaManuscript product presentation">
      <div className="mx-auto max-w-6xl">
        <Heading level={2} size="page" className="mb-8 text-balance">
          Everything you need for a structured beta round.
        </Heading>
        <div className="relative overflow-hidden border paper-shadow" style={{ borderColor: "hsl(var(--ink) / 0.16)", background: PAPER }}>
          <Swiper
            modules={[A11y, Autoplay]}
            onSwiper={onSliderReady}
            onSlideChange={(instance) => onSlideChange(instance.realIndex)}
            loop
            autoplay={reduceMotion ? false : { delay: 4800, disableOnInteraction: false, pauseOnMouseEnter: true }}
            a11y={{
              containerMessage: "BetaManuscript product presentation",
              slideLabelMessage: "Slide {{index}} of {{slidesLength}}",
            }}
          >
            {presentationSlides.map((slide, index) => (
              <SwiperSlide key={slide.label}>
                <div className="relative aspect-[143/65] min-h-52 bg-[#EDE8DC]">
                  <Image
                    alt={`BetaManuscript ${slide.label.toLowerCase()} workspace`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1200px) 1152px, (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)"
                    src={slide.src}
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-3 sm:px-5 sm:pb-5">
            <div className="flex max-w-full gap-2 overflow-x-auto bg-[hsl(var(--inverse-background))] p-4">
              {presentationSlides.map((slide, index) => {
                const isActive = index === activeSlide;

                return (
                  <button
                    key={slide.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => slider?.slideToLoop(index)}
                    className="inline-flex min-h-10 shrink-0 items-center border px-3 text-left text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
                    style={{
                      borderColor: isActive ? OXBLOOD : "hsl(var(--ink) / 0.18)",
                      background: isActive ? OXBLOOD : "hsl(var(--paper) / 0.94)",
                      color: isActive ? INVERSE_FOREGROUND : INK,
                    }}
                  >
                    <span>{slide.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepPreview({ kind }: { kind: StepPreviewKind }) {
  if (kind === "draft") {
    return (
      <div className="border p-4 sm:p-5" style={{ borderColor: "hsl(var(--ink) / 0.15)", background: CARD }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
          <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Manuscript setup</span>
          <span className="text-[9px]" style={{ color: FOREST, fontFamily: MONO }}>Saved</span>
        </div>
        <div className="mt-5 border p-4" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: PAPER }}>
          <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: MUTED, fontFamily: MONO }}>Draft 02</p>
          <p className="mt-2" style={{ color: INK, fontFamily: SERIF, fontSize: "1.3rem" }}>The Salt Orchard</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[["12", "chapters"], ["82k", "words"], ["8", "readers"]].map(([value, label]) => (
              <div key={label} className="border px-2 py-3" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
                <p className="text-sm" style={{ color: INK, fontFamily: SERIF }}>{value}</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.1em]" style={{ color: MUTED, fontFamily: MONO }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (kind === "readers") {
    return (
      <div className="border p-4 sm:p-5" style={{ borderColor: "hsl(var(--ink) / 0.15)", background: CARD }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
          <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Reader invitations</span>
          <span className="text-[9px]" style={{ color: MUTED, fontFamily: MONO }}>8 total</span>
        </div>
        <div className="mt-3 divide-y" style={{ borderColor: "hsl(var(--ink) / 0.09)" }}>
          {[
            ["Marin", "Reading chapter 04", FOREST],
            ["Sasha", "Left 3 notes", OXBLOOD],
            ["Toni", "Invitation sent", "#B3844F"],
          ].map(([name, status, color]) => (
            <div key={name} className="flex items-center gap-3 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-full text-[10px]" style={{ color: INVERSE_FOREGROUND, background: color, fontFamily: MONO }}>{name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1 text-xs" style={{ color: INK }}>{name}</span>
              <span className="text-[9px]" style={{ color: MUTED, fontFamily: MONO }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border p-4 sm:p-5" style={{ borderColor: "hsl(var(--ink) / 0.15)", background: CARD }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
        <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Feedback overview</span>
        <span className="text-[9px]" style={{ color: OXBLOOD_TEXT, fontFamily: MONO }}>24 notes</span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          ["Pacing", "7 annotations"],
          ["Character motivation", "5 annotations"],
          ["Confusion", "3 annotations"],
        ].map(([label, detail]) => (
          <div key={label}>
            <div className="flex justify-between gap-4 text-[9px]" style={{ color: BODY, fontFamily: MONO }}><span>{label}</span><span className="text-right">{detail}</span></div>
          </div>
        ))}
      </div>
      <div className="mt-5 border p-3" style={{ borderColor: "hsl(var(--oxblood) / 0.16)", background: "hsl(var(--oxblood) / 0.05)" }}>
        <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: OXBLOOD_TEXT, fontFamily: MONO }}>Revision priority</p>
        <p className="mt-2 text-[12px] leading-5" style={{ color: BODY }}>Pacing feedback in Chapter 04.</p>
      </div>
    </div>
  );
}

function RevisionPathPreview() {
  return (
    <div className="border p-5 sm:p-6" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.17)", background: "hsl(var(--inverse-foreground) / 0.045)" }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.15)" }}>
        <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: INVERSE_MUTED, fontFamily: MONO }}>A revision thread</span>
        <span className="text-[9px]" style={{ color: INVERSE_MUTED, fontFamily: MONO }}>Chapter 04</span>
      </div>
      <div className="mt-5 space-y-3">
        <DarkPathCard label="Reader pattern" title="Three annotations flagged pacing in Chapter 04." meta="Pacing · 3 annotations" accent="#D69C9C" />
        <div className="ml-5 border-l pl-5" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.25)" }}>
          <DarkPathCard label="Source feedback" title="“I understood it once the reveal happened, but felt lost for a page before.”" meta="Sasha · selected passage" accent="#9EB39E" compact />
        </div>
        <DarkPathCard label="Revision priority" title="Pacing feedback in Chapter 04." meta="3 annotations" accent="#E7C789" />
      </div>
    </div>
  );
}

function DarkPathCard({ accent, compact = false, label, meta, title }: { accent: string; compact?: boolean; label: string; meta: string; title: string }) {
  return (
    <div className="border p-4" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.14)", background: "hsl(var(--inverse-foreground) / 0.04)" }}>
      <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: accent, fontFamily: MONO }}>{label}</p>
      <p className={`mt-2 leading-5 ${compact ? "text-[12px] italic" : "text-sm"}`} style={{ color: INVERSE_FOREGROUND, fontFamily: SANS }}>{title}</p>
      <p className="mt-3 text-[9px]" style={{ color: INVERSE_MUTED, fontFamily: MONO }}>{meta}</p>
    </div>
  );
}
