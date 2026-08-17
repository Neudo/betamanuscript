import { BookMarked, MessageSquareQuote, Tags, UserRoundCheck, FileQuestion } from "lucide-react";

import { BODY, CARD, FOREST, INK, INVERSE_BACKGROUND, INVERSE_FOREGROUND, MONO, MUTED, OXBLOOD_TEXT, PAPER, WARM } from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import {
  BreadcrumbJsonLd,
  Breadcrumbs,
  FaqList,
  FinalCta,
  RelatedLinks,
  ScreenshotPlaceholder,
  UseCaseHero,
  UseCasePageFrame,
} from "@/views/use-cases/components/UseCaseShared";

const feedbackContext = [
  {
    Icon: MessageSquareQuote,
    detail: "See the exact sentence or paragraph that triggered the reaction.",
    title: "Passage",
  },
  {
    Icon: BookMarked,
    detail: "Understand where feedback appears in the manuscript.",
    title: "Chapter",
  },
  {
    Icon: UserRoundCheck,
    detail: "Return to the individual reader behind an annotation or survey response.",
    title: "Reader",
  },
  {
    Icon: Tags,
    detail: "Group reactions with feedback tags, including the default categories or your own custom tags on Pro.",
    title: "Feedback tag or category",
  },
  {
    Icon: FileQuestion,
    detail: "Keep answers to chapter or manuscript questions alongside the rest of the beta round.",
    title: "Surveys",
  },
] as const;

export function OrganizeBetaReaderFeedbackPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/use-cases/organize-beta-reader-feedback", label: "Organize beta reader feedback" },
  ];

  return (
    <UseCasePageFrame>
      <main>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <div className="mx-auto max-w-6xl px-6 pt-8 md:px-12"><Breadcrumbs items={breadcrumbs} /></div>
        <UseCaseHero
          actions={[
            { href: "/signup", label: "Start organizing feedback", primary: true },
            { href: "/how-it-works", label: "See how it works" },
          ]}
          title="Organize beta reader feedback before revision turns into guesswork."
        >
          <p>Keep every annotation and survey response connected to its reader, chapter, passage, and feedback category—then see which reactions keep coming back.</p>
        </UseCaseHero>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">Collecting feedback is only half the work.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: BODY }}>
              <p>A beta round can produce dozens or hundreds of comments. The difficult part is not collecting them—it is deciding what they mean together.</p>
              <p>Which reactions are isolated? Which problems appear across several readers? Which chapter keeps causing confusion? And which parts of the manuscript consistently work?</p>
              <p>BetaManuscript keeps that context attached to the feedback so you can review patterns without manually rebuilding them in a spreadsheet.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
              <div>
                <Heading level={2} className="max-w-md text-balance">Keep every reaction connected to its context.</Heading>
              </div>
              <p className="max-w-xl text-base leading-7" style={{ color: BODY }}>Instead of a pile of detached comments, each reaction carries the information needed to return to the manuscript and understand why it was given.</p>
            </div>
            <div className="mt-12 grid gap-px border sm:grid-cols-2 lg:grid-cols-5" style={{ background: "hsl(var(--ink) / 0.12)", borderColor: "hsl(var(--ink) / 0.12)" }}>
              {feedbackContext.map((item, index) => (
                <article key={item.title} className="min-h-full p-5 sm:p-6" style={{ background: index === 2 ? CARD : PAPER }}>
                  <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                    <item.Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <Heading level={3} className="mt-6">{item.title}</Heading>
                  <p className="mt-3 text-sm leading-6" style={{ color: BODY }}>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: INVERSE_BACKGROUND, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.79fr_1.21fr] lg:gap-20">
            <div>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">Separate isolated opinions from recurring issues.</Heading>
              <div className="mt-6 max-w-lg space-y-5 text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
                <p>Not every comment deserves the same weight. One reader may dislike a scene while several others respond positively. Another passage may confuse multiple readers independently.</p>
                <p>Seeing those reactions together helps you decide where to investigate first without treating every suggestion as an instruction.</p>
              </div>
            </div>
            <ScreenshotPlaceholder label="Recurring issue with source annotations">
              <div aria-hidden="true">
                <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Illustrative example</p>
                <div className="mt-4 border p-4" style={{ borderColor: "hsl(var(--oxblood) / 0.23)", background: "hsl(var(--oxblood) / 0.04)" }}>
                  <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: OXBLOOD_TEXT, fontFamily: MONO }}>Recurring issue</p>
                  <p className="mt-3 text-xl" style={{ color: INK, fontFamily: "'EB Garamond', serif" }}>Chapter 8 — Pacing</p>
                  <p className="mt-1 text-sm" style={{ color: BODY }}>4 readers flagged this section</p>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    "“I started skimming during the conversation.”",
                    "“This felt longer than the previous scenes.”",
                    "“I understood why the scene mattered, but it slowed the momentum.”",
                  ].map((quote) => (
                    <p key={quote} className="border px-3 py-3 text-sm leading-5" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)", color: BODY, fontFamily: "'EB Garamond', serif" }}>{quote}</p>
                  ))}
                </div>
                <div className="mt-4 border-l-2 py-1 pl-4" style={{ borderColor: FOREST }}>
                  <p className="text-[9px] uppercase tracking-[0.14em]" style={{ color: FOREST, fontFamily: MONO }}>Author revision note</p>
                  <p className="mt-2 text-sm leading-5" style={{ color: BODY }}>Review whether the conversation can reach its turning point earlier.</p>
                </div>
              </div>
            </ScreenshotPlaceholder>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">See what already works, too.</Heading>
            </div>
            <p className="max-w-2xl text-base leading-7" style={{ color: BODY }}>Repeated positive reactions can be just as useful as criticism. If several readers highlight the same reveal, character moment, or emotional beat positively, that is evidence worth protecting during revision.</p>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">Useful when feedback starts becoming difficult to compare.</Heading>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2" role="list">
              {[
                "Several readers are giving different reactions.",
                "Annotations and surveys are starting to accumulate.",
                "You are spending time rereading the same comments.",
                "You want to identify issues readers mentioned independently.",
                "You want a more structured view before revision begins.",
              ].map((item) => (
                <li key={item} className="border p-5 text-sm leading-6" style={{ background: CARD, borderColor: "hsl(var(--ink) / 0.13)", color: BODY }}>
                  <span className="mb-4 block h-1.5 w-7" style={{ background: OXBLOOD_TEXT }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-4xl">
            <Heading level={2} className="max-w-2xl text-balance">A practical way to review feedback before revision.</Heading>
            <div className="mt-12">
              <FaqList items={[
                {
                  question: "What is the best way to organize beta reader feedback?",
                  answer: <p>Keep who gave the feedback, where it appeared in the manuscript, the kind of reaction, similar comments, and broader survey answers together. BetaManuscript centralizes those details so you can review a reaction with its chapter, passage, reader, and tag instead of reconstructing that context later.</p>,
                },
                {
                  question: "Should I follow every suggestion from a beta reader?",
                  answer: <p>No. Beta reader feedback is evidence, not instruction. Look for recurring reactions and understand the reason behind a comment before deciding whether and how to revise.</p>,
                },
                {
                  question: "How do I know which beta reader feedback matters most?",
                  answer: <p>Look at repetition, context, and the goals of your manuscript. Several independent readers reacting to the same passage can be worth investigating, but a count does not turn an opinion into a rule. The author still decides what the feedback means.</p>,
                },
                {
                  question: "Can I organize feedback by chapter?",
                  answer: <p>Yes. Annotations remain attached to the chapter and passage that prompted them, so you can return to the relevant part of the manuscript while reviewing feedback.</p>,
                },
                {
                  question: "Can I use surveys alongside inline feedback?",
                  answer: <p>Yes. Use chapter or manuscript surveys for broader questions, then review those answers alongside the inline annotations from the same beta-reading round.</p>,
                },
                {
                  question: "Does BetaManuscript use AI to decide what I should rewrite?",
                  answer: <p>No. BetaManuscript helps organize reader feedback and reveal recurring patterns. The author decides what those reactions mean and what, if anything, should change in the manuscript.</p>,
                },
              ]} />
            </div>
          </div>
        </section>

        <RelatedLinks items={[
          {
            description: "See how a manuscript moves from invitation to feedback and revision.",
            href: "/how-it-works",
            title: "See the beta-reading workflow",
          },
          {
            description: "Compare reader, survey, manuscript, and feedback-tag limits.",
            href: "/pricing",
            title: "Compare plans",
          },
          {
            description: "Give every reader an independent place to read, react, and keep their progress.",
            href: "/use-cases/manage-multiple-beta-readers",
            title: "Manage multiple beta readers",
          },
        ]} />

        <FinalCta description="Keep individual reactions in context, find recurring issues, and decide what deserves your attention first." title="Go into revision knowing what your readers actually agreed on.">
          Start your beta round
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
