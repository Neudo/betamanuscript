import { BookOpenCheck, FileQuestion, MessageSquareQuote } from "lucide-react";

import { BODY, CARD, EDITORIAL_DARK, INVERSE_FOREGROUND, OXBLOOD_TEXT, PAPER, WARM } from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import {
  BreadcrumbJsonLd,
  Breadcrumbs,
  FaqList,
  FinalCta,
  RelatedLinks,
  UseCaseHero,
  UseCasePageFrame,
} from "@/views/use-cases/components/UseCaseShared";

const surveyRoles = [
  {
    Icon: MessageSquareQuote,
    detail: "Annotations capture a reaction to a particular sentence or passage while the reader is inside the manuscript.",
    title: "Where a reader reacted",
  },
  {
    Icon: BookOpenCheck,
    detail: "Chapter surveys let you ask about a specific part of the reading experience once that chapter has been read.",
    title: "A chapter in context",
  },
  {
    Icon: FileQuestion,
    detail: "Manuscript surveys help you ask broader questions about the full draft when a passage alone cannot answer them.",
    title: "The whole manuscript",
  },
] as const;

export function BetaReaderSurveysPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/use-cases/beta-reader-surveys", label: "Beta reader surveys" },
  ];

  return (
    <UseCasePageFrame>
      <main>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <div className="mx-auto max-w-6xl px-6 pt-8 md:px-12"><Breadcrumbs items={breadcrumbs} /></div>
        <UseCaseHero
          actions={[
            { href: "/signup", label: "Build your beta round", primary: true },
            { href: "/how-it-works", label: "See how it works" },
          ]}
          title="Ask beta readers the right questions while the story is still fresh."
        >
          <p>Use chapter and manuscript surveys for reactions that do not belong to one passage, then review the answers alongside the rest of the beta round.</p>
        </UseCaseHero>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">Annotations tell you where. Surveys help you ask why.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: BODY }}>
              <p>Inline feedback shows the exact moment that prompted a reader to react. Some of the questions you need to ask are broader: was the motivation clear, did the pacing work, or did the chapter create the intended feeling?</p>
              <p>BetaManuscript keeps both forms of feedback inside the same reading round. Readers can answer a question when they reach the relevant chapter or return to it later from their reader workspace.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <Heading level={2} className="max-w-xl text-balance">Use the right feedback format for the question.</Heading>
            <div className="mt-12 grid gap-px border md:grid-cols-3" style={{ background: "hsl(var(--ink) / 0.12)", borderColor: "hsl(var(--ink) / 0.12)" }}>
              {surveyRoles.map((role, index) => (
                <article key={role.title} className="min-h-full p-6 sm:p-7" style={{ background: index === 1 ? CARD : PAPER }}>
                  <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                    <role.Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <Heading level={3} className="mt-8 text-balance">{role.title}</Heading>
                  <p className="mt-4 text-sm leading-6" style={{ color: BODY }}>{role.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: EDITORIAL_DARK, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">Ask less. Learn more.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
              <p>A useful survey does not turn beta reading into homework. Start with a small, deliberate set of questions that helps you investigate the uncertainty you actually have about the draft.</p>
              <p>Keep questions open enough to hear the reader&apos;s own experience. A leading question can produce an answer, but it may hide the reaction you needed to understand.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-4xl">
            <Heading level={2} className="max-w-2xl text-balance">Beta reader surveys and questionnaires</Heading>
            <div className="mt-12">
              <FaqList items={[
                {
                  question: "How many questions should I ask beta readers?",
                  answer: <p>Ask only the questions that will help you make a better revision decision. A short, deliberate survey is more likely to produce thoughtful answers than a long questionnaire.</p>,
                },
                {
                  question: "What should I ask beta readers?",
                  answer: <p>Ask about the uncertainty you need to investigate: clarity, pacing, character motivation, emotional impact, or another broader reaction that does not belong to one exact passage.</p>,
                },
                {
                  question: "Can I add surveys for a specific chapter?",
                  answer: <p>Yes. Create a chapter survey for a specific chapter, or a manuscript survey for the complete draft.</p>,
                },
                {
                  question: "Can I use surveys and annotations together?",
                  answer: <p>Yes. Annotations capture passage-level reactions, while surveys collect broader responses. Both remain connected to the same beta-reading round.</p>,
                },
                {
                  question: "Can readers return to a survey later?",
                  answer: <p>Yes. Readers can answer surveys when they reach them or return to them later from their reader workspace.</p>,
                },
                {
                  question: "Are surveys available on the Free plan?",
                  answer: <p>Yes. The Free plan includes two surveys. The Author plan includes unlimited surveys.</p>,
                },
              ]} />
            </div>
          </div>
        </section>

        <RelatedLinks items={[
          {
            description: "Keep broad survey answers and inline reactions connected before revision.",
            href: "/use-cases/organize-beta-reader-feedback",
            title: "Organize beta reader feedback",
          },
          {
            description: "Bring several independent readers into the same focused beta-reading round.",
            href: "/use-cases/manage-multiple-beta-readers",
            title: "Manage multiple beta readers",
          },
          {
            description: "Compare survey limits and the rest of each plan before you begin.",
            href: "/pricing",
            title: "Compare plans",
          },
        ]} />

        <FinalCta description="Ask readers for the wider reactions your revision needs, without separating their answers from the manuscript they read." title="Build a more structured beta round.">
          Build your beta round
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
