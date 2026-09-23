import { BookOpenCheck, ChartNoAxesCombined, FileQuestion } from "lucide-react";

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

const betaReadingCapabilities = [
  {
    Icon: BookOpenCheck,
    detail: "Give each reader a focused place to read at their own pace instead of asking everyone to work in one shared document.",
    title: "Independent reader experiences",
  },
  {
    Icon: ChartNoAxesCombined,
    detail: "Keep passage-level reactions, reader progress, and recurring issues visible in the same beta round.",
    title: "Feedback in context",
  },
  {
    Icon: FileQuestion,
    detail: "Ask chapter or manuscript questions when you need reactions that do not belong to one specific passage.",
    title: "Annotations and surveys together",
  },
] as const;

export function GoogleDocsAlternativePage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/use-cases/google-docs-alternative-for-beta-reading", label: "Google Docs alternative for beta reading" },
  ];

  return (
    <UseCasePageFrame>
      <main>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <div className="mx-auto max-w-6xl px-6 pt-8 md:px-12"><Breadcrumbs items={breadcrumbs} /></div>
        <UseCaseHero
          actions={[
            { href: "/signup", label: "Start your beta round", primary: true },
            { href: "/how-it-works", label: "See how it works" },
          ]}
          title="A Google Docs alternative built for beta reading."
        >
          <p>Give independent beta readers a focused reading experience, then review their feedback, progress, and recurring reactions in one workspace.</p>
        </UseCaseHero>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">Google Docs is not the wrong tool. It is a different tool.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: BODY }}>
              <p>Google Docs works well when you&apos;re revising with one collaborator or working through line edits together. A beta-reading round is different: several independent readers move through the same manuscript at their own pace, react to different passages, and answer broader questions about the draft.</p>
              <p>That does not make Google Docs inadequate. It means the workflow needs a place designed to keep readers independent while giving the author one view of the whole round.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <Heading level={2} className="max-w-xl text-balance">Run the beta-reading workflow in one place.</Heading>
            <div className="mt-12 grid gap-px border md:grid-cols-3" style={{ background: "hsl(var(--ink) / 0.12)", borderColor: "hsl(var(--ink) / 0.12)" }}>
              {betaReadingCapabilities.map((capability, index) => (
                <article key={capability.title} className="min-h-full p-6 sm:p-7" style={{ background: index === 1 ? CARD : PAPER }}>
                  <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                    <capability.Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <Heading level={3} className="mt-8 text-balance">{capability.title}</Heading>
                  <p className="mt-4 text-sm leading-6" style={{ color: BODY }}>{capability.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: EDITORIAL_DARK, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">Feedback is evidence, not a shared editing queue.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
              <p>BetaManuscript keeps annotations and surveys connected to the passage, chapter, and reader that produced them. You can return from a recurring reaction to its original context instead of reconstructing the trail across documents, email threads, and forms.</p>
              <p>It does not replace Google Docs as a writing editor. It handles the part Google Docs was not designed to coordinate: independent beta-reader feedback across a complete reading round.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-4xl">
            <Heading level={2} className="max-w-2xl text-balance">Google Docs and beta reading</Heading>
            <div className="mt-12">
              <FaqList items={[
                {
                  question: "Is Google Docs good for beta reading?",
                  answer: <p>It can be a good fit for a single reader, collaborative line edits, or active co-writing. BetaManuscript is designed for a different situation: several independent readers moving through the same manuscript and giving feedback in their own time.</p>,
                },
                {
                  question: "Can beta readers see each other’s feedback?",
                  answer: <p>No. A reader&apos;s annotations and survey responses are visible to that reader and the author, not to other beta readers.</p>,
                },
                {
                  question: "Do I need one document for every beta reader?",
                  answer: <p>No. BetaManuscript keeps every reader in the same beta round while preserving the context and independence of each person&apos;s feedback.</p>,
                },
                {
                  question: "Is BetaManuscript a writing editor?",
                  answer: <p>No. It helps authors run a beta-reading round, organize reader reactions, and decide what deserves investigation before revision.</p>,
                },
                {
                  question: "Can I bring my own beta readers?",
                  answer: <p>Yes. BetaManuscript is not a beta-reader marketplace. Authors invite the readers they already trust.</p>,
                },
                {
                  question: "Does BetaManuscript use AI to rewrite my manuscript?",
                  answer: <p>No. BetaManuscript organizes feedback from human beta readers. The author decides what those reactions mean and what, if anything, should change in the manuscript.</p>,
                },
              ]} />
            </div>
          </div>
        </section>

        <RelatedLinks items={[
          {
            description: "See every beta-reading workflow covered by BetaManuscript.",
            href: "/use-cases",
            title: "Explore beta reading use cases",
          },
          {
            description: "Bring several readers into one round without merging their feedback.",
            href: "/use-cases/manage-multiple-beta-readers",
            title: "Manage multiple beta readers",
          },
          {
            description: "Keep every reaction connected to its reader, chapter, passage, and tag.",
            href: "/use-cases/organize-beta-reader-feedback",
            title: "Organize beta reader feedback",
          },
        ]} />

        <FinalCta description="Bring your readers into one focused beta-reading workflow instead of rebuilding the round across shared documents and scattered feedback." title="Run your next beta round outside Google Docs.">
          Run your next beta round outside Google Docs
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
