"use client";

import {
  ArrowRight,
  BookmarkCheck,
  Check,
  CircleHelp,
  Highlighter,
  Mail,
  MessageSquareText,
  MousePointer2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { Footer } from "@/views/waitlist/components/Footer";
import { Nav } from "@/views/waitlist/components/Nav";
import { Heading } from "@/shared/ui/Heading";
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

const steps = [
  {
    Icon: Mail,
    number: "01",
    title: "Open your invitation",
    detail:
      "Your author sends you a private invitation by email. Create an account or sign in with the same email address to access the manuscript and save your progress.",
  },
  {
    Icon: BookmarkCheck,
    number: "02",
    title: "Start reading",
    detail:
      "The manuscript appears in your reading list with its chapters, deadline, and saved reading progress in one place.",
  },
  {
    Icon: Highlighter,
    number: "03",
    title: "React in the moment",
    detail:
      "Highlight the passage that made you react, choose a feedback tag, and add a note when you want to explain why.",
  },
  {
    Icon: MessageSquareText,
    number: "04",
    title: "Answer the author’s questions",
    detail:
      "Complete chapter or manuscript surveys while your reactions are fresh, or return to them later from your reader workspace.",
  },
];

const feedbackPrompts = [
  "I was hooked here because…",
  "I lost the thread when…",
  "I expected… but instead…",
];

export function ForReadersPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: PAPER, color: INK, fontFamily: SANS }}>
      <Nav />

      <main>
        <section className="relative isolate overflow-hidden border-b px-6 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              backgroundImage: "radial-gradient(circle at 13% 28%, hsl(var(--oxblood) / 0.1), transparent 24rem), radial-gradient(circle at 88% 3%, hsl(var(--forest) / 0.1), transparent 25rem)",
            }}
          />
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,0.82fr)] lg:gap-20">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: premiumEase }}
            >
              <Heading level={1} className="max-w-2xl text-balance">
                Read the manuscript. Share your reactions as they happen.
              </Heading>
              <p className="mt-7 max-w-xl text-pretty text-base leading-8 sm:text-lg" style={{ color: BODY }}>
                BetaManuscript gives you a focused place to read an author&apos;s manuscript, save your progress, and leave feedback on the exact passages that made you react.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  style={{ background: OXBLOOD, borderColor: OXBLOOD, color: INVERSE_FOREGROUND }}
                >
                  I have an invitation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#how-it-works"
                  className="text-sm underline decoration-1 underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7b1d1d]"
                  style={{ color: INK }}
                >
                  See how it works
                </a>
              </div>
              <p className="mt-5 text-xs leading-5" style={{ color: MUTED }}>
                Free for beta readers · No subscription or payment details required
              </p>
            </motion.div>

            <motion.div
              className="relative mx-auto w-full max-w-[510px] lg:mr-0"
              initial={reduceMotion ? false : { opacity: 0, y: 26, rotate: 1.2 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.82, delay: 0.12, ease: premiumEase }}
            >
              <ReaderPreview />
            </motion.div>
          </div>
        </section>

        <section className="border-b px-6 py-16 md:px-12 md:py-24" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.76fr_1.24fr] lg:gap-20">
            <div>
              <Heading level={2} className="mt-5 max-w-md">
                React honestly. <em>Not perfectly.</em>
              </Heading>
            </div>
            <div className="grid gap-px border border-black/10 sm:grid-cols-2" style={{ background: "hsl(var(--ink) / 0.1)" }}>
              <ReaderPrinciple
                eyebrow="Read"
                title="Stay with the story"
                detail="Read each manuscript chapter by chapter in a clean, distraction-free view. Everything you have been invited to read stays in one reading list."
              />
              <ReaderPrinciple
                eyebrow="Notice"
                title="Mark the exact moment"
                detail="Highlight the exact passage that made you pause, smile, doubt, or want to keep reading."
              />
              <ReaderPrinciple
                eyebrow="Explain"
                title="Describe your reaction"
                detail="Confusion, delight, doubt, curiosity—tell the author what you experienced and which passage caused it."
              />
              <ReaderPrinciple
                eyebrow="Continue"
                title="Pick up where you left off"
                detail="When you complete a chapter, your progress is saved, so you can return to the next chapter later."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-b px-6 py-20 md:px-12 md:py-28" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.24em]" style={{ fontFamily: MONO, color: MUTED }}>The reading flow</p>
              <Heading level={2} className="mt-5">
                From invitation to feedback in four simple steps.
              </Heading>
            </div>

            <ol className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => (
                <motion.li
                  key={step.number}
                  className="group relative border-t pt-5"
                  style={{ borderColor: "hsl(var(--ink) / 0.18)" }}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.52, delay: index * 0.06, ease: premiumEase }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.16em]" style={{ fontFamily: MONO, color: MUTED }}>{step.number}</span>
                    <step.Icon className="h-4 w-4" style={{ color: OXBLOOD_TEXT }} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <Heading level={3} className="mt-7">{step.title}</Heading>
                  <p className="mt-4 text-sm leading-6" style={{ color: BODY }}>{step.detail}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: INVERSE_BACKGROUND, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em]" style={{ fontFamily: MONO, color: INVERSE_MUTED }}>A useful reaction is enough</p>
              <Heading level={2} tone="inverse" className="mt-5 max-w-md">
                You don&apos;t need to be an editor to give excellent feedback.
              </Heading>
              <p className="mt-6 max-w-lg text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
                Your job is not to rewrite the manuscript. Tell the author where you felt engaged, confused, unconvinced, or eager to continue—and point to the passage that caused that reaction.
              </p>
            </div>
            <div className="grid gap-3">
              {feedbackPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt}
                  className="flex min-h-20 items-center gap-5 border px-5 py-4 sm:px-6"
                  style={{ background: index === 1 ? "hsl(var(--oxblood) / 0.42)" : "hsl(var(--inverse-foreground) / 0.055)", borderColor: "hsl(var(--inverse-foreground) / 0.16)" }}
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.46, delay: index * 0.07, ease: premiumEase }}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px]" style={{ borderColor: "hsl(var(--inverse-foreground) / 0.36)", color: INVERSE_FOREGROUND, fontFamily: MONO }}>{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-lg leading-6" style={{ fontFamily: SERIF }}>{prompt}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: CARD }}>
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} className="mt-5">
              What beta readers need to know.
            </Heading>

            <div className="mt-12 border-y text-left" style={{ borderColor: "hsl(var(--ink) / 0.14)" }}>
              <ReaderQuestion
                question="Is BetaManuscript free for beta readers?"
                answer="Yes. Authors pay for the workspace. You can read manuscripts and leave feedback without purchasing a subscription or entering payment details."
              />
              <ReaderQuestion
                question="Why do I need an account?"
                answer="Your account keeps invited manuscripts private, saves your reading progress, and gathers your current reading rounds in one place."
              />
              <ReaderQuestion
                question="Can other beta readers see my feedback?"
                answer="No. Your annotations and survey responses are visible to you and the author, not to other beta readers."
              />
              <ReaderQuestion
                question="Can I edit a note after submitting it?"
                answer="Yes. Open your own annotation to change its tag or comment, or delete it. The selected passage stays fixed."
              />
              <ReaderQuestion
                question="Can I share the manuscript with someone else?"
                answer="No. Your invitation gives you private access to the manuscript. Do not copy or share it with anyone else."
              />
            </div>
          </div>
        </section>

        <section className="border-t px-6 py-16 text-center md:px-12 md:py-20" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: PAPER }}>
          <CircleHelp className="mx-auto h-5 w-5" style={{ color: FOREST }} strokeWidth={1.5} aria-hidden="true" />
          <Heading level={2} className="mx-auto mt-5 max-w-xl text-balance">
            Already invited to read?
          </Heading>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6" style={{ color: BODY }}>
            Sign in with the email address that received the invitation to open the manuscript and continue reading.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex min-h-12 items-center gap-2 border px-5 text-sm font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7b1d1d]"
            style={{ borderColor: "hsl(var(--ink) / 0.24)", color: INK }}
          >
            Log in to read
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ReaderPreview() {
  return (
    <div className="relative border p-3 shadow-[0_20px_55px_hsl(var(--inverse-background)/0.16)] sm:p-4" style={{ background: CARD, borderColor: "hsl(var(--ink) / 0.18)" }}>
      <div className="flex items-center justify-between border-b px-3 pb-3 text-[9px] uppercase tracking-[0.16em]" style={{ borderColor: "hsl(var(--ink) / 0.1)", color: MUTED, fontFamily: MONO }}>
        <span>Reader workspace</span>
        <span>Chapter 04 / 08</span>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_150px] sm:p-5">
        <article className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: MUTED, fontFamily: MONO }}>The glass corridor</p>
          <p className="mt-5 text-[18px] leading-8 sm:text-[20px]" style={{ color: BODY, fontFamily: SERIF }}>
            By the time the bell rang, she had already decided to leave. The letter in her pocket made every corridor feel narrower.
          </p>
          <p className="mt-5 text-[18px] leading-8 sm:text-[20px]" style={{ color: BODY, fontFamily: SERIF }}>
            <span className="px-0.5" style={{ background: "hsl(var(--oxblood) / 0.18)" }}>Then she saw the door at the end of the hall standing open.</span> Nobody had mentioned a door.
          </p>
          <p className="mt-5 text-[18px] leading-8 sm:text-[20px]" style={{ color: BODY, fontFamily: SERIF }}>
            The room beyond it was dark, except for the thin line of light beneath the desk.
          </p>
        </article>
        <aside className="border p-3 sm:mt-12" style={{ borderColor: "hsl(var(--oxblood) / 0.26)", background: "hsl(var(--oxblood) / 0.045)" }}>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em]" style={{ color: OXBLOOD_TEXT, fontFamily: MONO }}>
            <MousePointer2 className="h-3 w-3" aria-hidden="true" />
            Your note
          </div>
          <p className="mt-4 text-sm leading-5" style={{ color: INK, fontFamily: SERIF }}>
            I wanted to know why nobody had mentioned this before.
          </p>
          <div className="mt-5 border-t pt-3" style={{ borderColor: "hsl(var(--oxblood) / 0.16)" }}>
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.1em]" style={{ color: FOREST, fontFamily: MONO }}>
              <Check className="h-3 w-3" aria-hidden="true" />
              Feedback saved
            </span>
          </div>
        </aside>
      </div>
      <div className="mx-3 flex items-center gap-2 border-t px-3 py-3 text-[9px] uppercase tracking-[0.15em] sm:mx-5" style={{ borderColor: "hsl(var(--ink) / 0.1)", color: MUTED, fontFamily: MONO }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: FOREST }} />
        Your place is saved
      </div>
    </div>
  );
}

function ReaderPrinciple({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <article className="p-6 sm:p-7" style={{ background: WARM }}>
      <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTED, fontFamily: MONO }}>{eyebrow}</p>
      <Heading level={3} className="mt-5">{title}</Heading>
      <p className="mt-3 text-sm leading-6" style={{ color: BODY }}>{detail}</p>
    </article>
  );
}

function ReaderQuestion({ answer, question }: { answer: string; question: string }) {
  return (
    <article className="border-b px-1 py-6 last:border-b-0 sm:px-3" style={{ borderColor: "hsl(var(--ink) / 0.12)" }}>
      <Heading level={3}>{question}</Heading>
      <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: BODY }}>{answer}</p>
    </article>
  );
}
