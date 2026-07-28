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
  MONO,
  MUTED,
  OXBLOOD,
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
    label: "Find the signal",
    title: "Turn scattered reactions into revision decisions.",
    detail:
      "Review tagged notes, survey responses, and recurring issues by chapter. The patterns stay visible when it is time to decide what to revise.",
    preview: "insights",
  },
] as const;

const presentationSlides = [
  {
    number: "01",
    label: "Manuscript",
    src: "/images/slide-manuscript.jpg",
  },
  {
    number: "02",
    label: "Readers",
    src: "/images/slide-reader.jpg",
  },
  {
    number: "03",
    label: "Feedback",
    src: "/images/slide-feedback.jpg",
  },
  {
    number: "04",
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
        <section className="relative isolate overflow-hidden border-b px-6 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24" style={{ borderColor: "rgba(28,24,18,0.1)" }}>
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(circle at 87% 5%, rgba(123,29,29,0.12), transparent 23rem), radial-gradient(circle at 5% 90%, rgba(44,62,45,0.1), transparent 25rem)",
            }}
          />
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: premiumEase }}
            >
              <Heading level={1} className="max-w-2xl text-balance">
                Your beta round, from first reader to <em>better revision.</em>
              </Heading>
              <p className="mt-7 max-w-xl text-pretty text-base leading-8 sm:text-lg" style={{ color: BODY }}>
                BetaManuscript keeps your chapters, readers, passage-level feedback, and revision decisions together in one focused workspace.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7b1d1d]"
                  style={{ background: OXBLOOD, borderColor: OXBLOOD, color: PAPER }}
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
                Built for authors who want clear reader signal, not more scattered threads.
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

        <section id="flow" className="scroll-mt-20 border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "rgba(28,24,18,0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end">
              <div>
                <Eyebrow>The beta-reading flow</Eyebrow>
                <Heading level={2} className="max-w-md text-balance">
                  A simple process with <em>a better handoff.</em>
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
                  style={{ borderColor: "rgba(28,24,18,0.16)" }}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.58, ease: premiumEase }}
                >
                  <div className={index % 2 === 1 ? "md:order-2" : undefined}>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] tracking-[0.18em]" style={{ color: MUTED, fontFamily: MONO }}>{step.number}</span>
                      <span className="h-px w-8" style={{ background: "rgba(28,24,18,0.2)" }} />
                      <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: MONO }}>{step.label}</span>
                    </div>
                    <div className="mt-7 flex h-10 w-10 items-center justify-center border" style={{ borderColor: "rgba(28,24,18,0.15)", background: CARD, color: OXBLOOD }}>
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

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: INK, borderColor: "rgba(245,240,232,0.16)", color: PAPER }}>
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <Eyebrow inverse>From reaction to decision</Eyebrow>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">
                The context is there when you need to <em>choose what changes.</em>
              </Heading>
              <p className="mt-6 max-w-lg text-base leading-7" style={{ color: "#DED7CA" }}>
                Reader reactions remain tied to the chapter, the passage, and the theme behind them. You can move from a pattern to the original feedback without rebuilding the trail.
              </p>
            </div>
            <RevisionPathPreview />
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: CARD }}>
          <div className="mx-auto max-w-4xl border px-6 py-12 text-center sm:px-12 sm:py-16" style={{ borderColor: "rgba(28,24,18,0.16)", background: PAPER }}>
            <Eyebrow centered>Ready for a clearer beta round?</Eyebrow>
            <Heading level={2} className="mx-auto max-w-2xl text-balance">
              Let every reader reaction find its way into your <em>revision.</em>
            </Heading>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7" style={{ color: BODY }}>
              Start with one manuscript, invite the readers you trust, and keep their feedback organized from the first chapter onward.
            </p>
            <Link
              href="/signup"
              className="mt-9 inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7b1d1d]"
              style={{ background: OXBLOOD, borderColor: OXBLOOD, color: PAPER }}
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
  const color = inverse ? "#C8C2B6" : MUTED;
  const lineColor = inverse ? "rgba(245,240,232,0.24)" : "rgba(28,24,18,0.24)";

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
    <section className="border-b px-6 py-10 md:px-12 md:py-14" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }} aria-label="BetaManuscript product presentation">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden border paper-shadow" style={{ borderColor: "rgba(28,24,18,0.16)", background: PAPER }}>
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
              <SwiperSlide key={slide.number}>
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
            <div className="flex max-w-full gap-2 overflow-x-auto bg-black p-4">
              {presentationSlides.map((slide, index) => {
                const isActive = index === activeSlide;

                return (
                  <button
                    key={slide.number}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => slider?.slideToLoop(index)}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 border px-3 text-left text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7b1d1d]"
                    style={{
                      borderColor: isActive ? OXBLOOD : "rgba(28,24,18,0.18)",
                      background: isActive ? OXBLOOD : "rgba(245,240,232,0.94)",
                      color: isActive ? PAPER : INK,
                    }}
                  >
                    <span className="text-[9px] tracking-[0.12em]" style={{ color: isActive ? "rgba(245,240,232,0.72)" : MUTED, fontFamily: MONO }}>{slide.number}</span>
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
      <div className="border p-4 sm:p-5" style={{ borderColor: "rgba(28,24,18,0.15)", background: CARD }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(28,24,18,0.1)" }}>
          <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Manuscript setup</span>
          <span className="text-[9px]" style={{ color: FOREST, fontFamily: MONO }}>Saved</span>
        </div>
        <div className="mt-5 border p-4" style={{ borderColor: "rgba(28,24,18,0.1)", background: PAPER }}>
          <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: MUTED, fontFamily: MONO }}>Draft 02</p>
          <p className="mt-2" style={{ color: INK, fontFamily: SERIF, fontSize: "1.3rem" }}>The Salt Orchard</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[["12", "chapters"], ["82k", "words"], ["8", "readers"]].map(([value, label]) => (
              <div key={label} className="border px-2 py-3" style={{ borderColor: "rgba(28,24,18,0.1)" }}>
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
      <div className="border p-4 sm:p-5" style={{ borderColor: "rgba(28,24,18,0.15)", background: CARD }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(28,24,18,0.1)" }}>
          <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Reader invitations</span>
          <span className="text-[9px]" style={{ color: MUTED, fontFamily: MONO }}>8 total</span>
        </div>
        <div className="mt-3 divide-y" style={{ borderColor: "rgba(28,24,18,0.09)" }}>
          {[
            ["Marin", "Reading chapter 04", FOREST],
            ["Sasha", "Left 3 notes", OXBLOOD],
            ["Toni", "Invitation sent", "#B3844F"],
          ].map(([name, status, color]) => (
            <div key={name} className="flex items-center gap-3 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-full text-[10px]" style={{ color: PAPER, background: color, fontFamily: MONO }}>{name.slice(0, 1)}</span>
              <span className="min-w-0 flex-1 text-xs" style={{ color: INK }}>{name}</span>
              <span className="text-[9px]" style={{ color: MUTED, fontFamily: MONO }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border p-4 sm:p-5" style={{ borderColor: "rgba(28,24,18,0.15)", background: CARD }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(28,24,18,0.1)" }}>
        <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Feedback overview</span>
        <span className="text-[9px]" style={{ color: OXBLOOD, fontFamily: MONO }}>24 notes</span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          ["Pacing", 76, OXBLOOD],
          ["Character", 55, FOREST],
          ["Confusion", 38, "#B3844F"],
        ].map(([label, width, color]) => (
          <div key={label}>
            <div className="flex justify-between text-[9px]" style={{ color: BODY, fontFamily: MONO }}><span>{label}</span><span>{width}%</span></div>
            <div className="mt-1.5 h-1.5" style={{ background: "rgba(28,24,18,0.08)" }}><div className="h-full" style={{ width: `${width}%`, background: color }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-5 border p-3" style={{ borderColor: "rgba(123,29,29,0.16)", background: "rgba(123,29,29,0.05)" }}>
        <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: OXBLOOD, fontFamily: MONO }}>Revision focus</p>
        <p className="mt-2 text-[12px] leading-5" style={{ color: BODY }}>Revisit the scene transition in Chapter 04.</p>
      </div>
    </div>
  );
}

function RevisionPathPreview() {
  return (
    <div className="border p-5 sm:p-6" style={{ borderColor: "rgba(245,240,232,0.17)", background: "rgba(245,240,232,0.045)" }}>
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(245,240,232,0.15)" }}>
        <span className="text-[9px] uppercase tracking-[0.18em]" style={{ color: "#C8C2B6", fontFamily: MONO }}>A revision thread</span>
        <span className="text-[9px]" style={{ color: "#C8C2B6", fontFamily: MONO }}>Chapter 04</span>
      </div>
      <div className="mt-5 space-y-3">
        <DarkPathCard label="Reader pattern" title="Three readers wanted one more clue before the reveal." meta="Pacing · 3 annotations" accent="#D69C9C" />
        <div className="ml-5 border-l pl-5" style={{ borderColor: "rgba(245,240,232,0.25)" }}>
          <DarkPathCard label="Source feedback" title="“I understood it once the reveal happened, but felt lost for a page before.”" meta="Sasha · selected passage" accent="#9EB39E" compact />
        </div>
        <DarkPathCard label="Revision focus" title="Seed the orchard’s history in the prior scene." meta="Open priority" accent="#E7C789" />
      </div>
    </div>
  );
}

function DarkPathCard({ accent, compact = false, label, meta, title }: { accent: string; compact?: boolean; label: string; meta: string; title: string }) {
  return (
    <div className="border p-4" style={{ borderColor: "rgba(245,240,232,0.14)", background: "rgba(245,240,232,0.04)" }}>
      <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: accent, fontFamily: MONO }}>{label}</p>
      <p className={`mt-2 leading-5 ${compact ? "text-[12px] italic" : "text-sm"}`} style={{ color: PAPER, fontFamily: compact ? SERIF : SANS }}>{title}</p>
      <p className="mt-3 text-[9px]" style={{ color: "#C8C2B6", fontFamily: MONO }}>{meta}</p>
    </div>
  );
}
