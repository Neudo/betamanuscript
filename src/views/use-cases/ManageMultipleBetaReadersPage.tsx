import { BookOpenCheck, ChartNoAxesCombined, Mail, MessageSquareText } from "lucide-react";

import { BODY, CARD, EDITORIAL_DARK, INK, INVERSE_FOREGROUND, MONO, MUTED, OXBLOOD_TEXT, PAPER, WARM } from "@/shared/config/design-tokens";
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

const workflowSteps = [
  {
    Icon: Mail,
    detail: "Bring the beta readers you already trust and invite them directly to your manuscript.",
    title: "Invite your readers",
  },
  {
    Icon: BookOpenCheck,
    detail: "Readers can move through the manuscript at their own pace, save their progress, and leave reactions without working inside a shared comment thread.",
    title: "Give each reader their own experience",
  },
  {
    Icon: ChartNoAxesCombined,
    detail: "See who has started reading, how far they have progressed, and which feedback has already been submitted.",
    title: "Follow the beta round",
  },
  {
    Icon: MessageSquareText,
    detail: "Once feedback arrives, review annotations and survey responses without opening separate copies of the manuscript.",
    title: "Review everything together",
  },
] as const;

const usefulWhen = [
  "You are working with several beta readers at the same time.",
  "Readers are progressing through the manuscript at different speeds.",
  "You want feedback to remain independent between readers.",
  "You use both passage-level annotations and questionnaires.",
  "You need to compare reactions before deciding what to revise.",
];

export function ManageMultipleBetaReadersPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/use-cases/manage-multiple-beta-readers", label: "Manage multiple beta readers" },
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
          title="Manage feedback from multiple beta readers without losing the big picture."
        >
          <p>Give every reader a focused place to read and react while keeping their annotations, surveys, and progress organized in one workspace.</p>
        </UseCaseHero>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">
                More readers should mean better feedback, not more admin.
              </Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: BODY }}>
              <p>One beta reader leaves notes in a document. Another sends feedback by email. Someone else fills out a questionnaire days later. Once several readers are involved, keeping track of who said what—and where they agreed—quickly becomes its own job.</p>
              <p>BetaManuscript keeps each reader&apos;s experience separate while giving the author one place to review the entire beta round.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <Heading level={2} className="text-balance">One manuscript. Multiple independent readers.</Heading>
            </div>
            <div className="mt-12 grid gap-px border sm:grid-cols-2" style={{ background: "hsl(var(--ink) / 0.12)", borderColor: "hsl(var(--ink) / 0.12)" }}>
              {workflowSteps.map((step, index) => (
                <article key={step.title} className="p-6 sm:p-7" style={{ background: index === 1 ? CARD : PAPER }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                      <step.Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </div>
                  <Heading level={3} className="mt-8 max-w-sm">{step.title}</Heading>
                  <p className="mt-4 max-w-md text-sm leading-6" style={{ color: BODY }}>{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: EDITORIAL_DARK, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">
                One opinion is useful. Repeated reactions are a pattern.
              </Heading>
              <div className="mt-6 max-w-lg space-y-5 text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
                <p>A single reader may find a chapter slow. That can be personal preference. When several readers flag the same section, the issue becomes much more useful to investigate.</p>
                <p>BetaManuscript keeps every reaction attached to its original chapter and passage, making it easier to compare individual opinions without losing their context.</p>
              </div>
            </div>
            <ScreenshotPlaceholder label="Recurring reader reactions">
              <div aria-hidden="true">
                <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: MUTED, fontFamily: MONO }}>Illustrative example</p>
                <p className="mt-4 text-xl" style={{ color: INK, fontFamily: "'EB Garamond', serif" }}>Chapter 6 — Pacing</p>
                <p className="mt-1 text-sm" style={{ color: BODY }}>4 readers mentioned this issue</p>
                <div className="mt-5 space-y-2 border-t pt-4" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
                  {["Annotation from reader one", "Annotation from reader two", "Annotation from reader three", "Annotation from reader four"].map((annotation) => (
                    <div key={annotation} className="flex items-center gap-3 border px-3 py-2.5" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: PAPER }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: OXBLOOD_TEXT }} />
                      <span className="text-xs" style={{ color: BODY }}>{annotation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScreenshotPlaceholder>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.73fr_1.27fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">When managing multiple beta readers becomes difficult</Heading>
            </div>
            <ul
              className="grid min-w-0 auto-cols-[100%] grid-flow-col gap-3 overflow-x-auto pb-3 pr-6 [scrollbar-width:none] snap-x snap-mandatory md:auto-cols-[calc((100%_-_1.5rem)/2.3)] [&::-webkit-scrollbar]:hidden"
              role="list"
            >
              {usefulWhen.map((item) => (
                <li key={item} className="min-h-44 snap-start border p-5 text-sm leading-6" style={{ background: CARD, borderColor: "hsl(var(--ink) / 0.13)", color: BODY }}>
                  <span className="mb-4 block h-1.5 w-7" style={{ background: OXBLOOD_TEXT }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">You may not need BetaManuscript if…</Heading>
            </div>
            <div className="space-y-4">
              {[
                "You are getting feedback from a single reader and a shared document already works well for you.",
                "You are looking for a marketplace that finds beta readers for you.",
                "You need collaborative line editing rather than independent beta-reader reactions.",
              ].map((item) => (
                <p key={item} className="border-l-2 pl-5 text-base leading-7" style={{ borderColor: "hsl(var(--oxblood) / 0.6)", color: BODY }}>{item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-4xl">
            <Heading level={2} className="max-w-2xl text-balance">Managing a beta round, clearly.</Heading>
            <div className="mt-12">
              <FaqList items={[
                {
                  question: "How many beta readers can I manage with BetaManuscript?",
                  answer: <p>The Free plan supports up to 5 beta readers per active manuscript. The Pro plan supports unlimited beta readers. You can compare the current plan limits on the pricing page.</p>,
                },
                {
                  question: "Can beta readers see each other’s feedback?",
                  answer: <p>No. A reader&apos;s annotations and survey responses are visible to that reader and the author, not to other beta readers.</p>,
                },
                {
                  question: "Do beta readers need to install anything?",
                  answer: <p>No. Beta readers open the reading page in a web browser. A shared reading page can be opened directly; readers create a free account when they want to save feedback. Private invitations use the invited email address.</p>,
                },
                {
                  question: "Can I track beta reader progress?",
                  answer: <p>Yes. The reader overview shows whether each invited reader has started, their current reading progress, and whether feedback has been submitted.</p>,
                },
                {
                  question: "Can I ask different questions during a beta read?",
                  answer: <p>Yes. You can use surveys at the chapter level or for the manuscript, so readers can answer broader questions alongside their passage-level annotations.</p>,
                },
                {
                  question: "Does BetaManuscript find beta readers for me?",
                  answer: <p>No. BetaManuscript is not a beta-reader marketplace. Authors invite their own readers and use the platform to manage the reading round and organize their feedback.</p>,
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
            description: "Keep feedback connected to its chapter, passage, reader, and tag.",
            href: "/use-cases/organize-beta-reader-feedback",
            title: "Organize beta reader feedback",
          },
        ]} />

        <FinalCta description="Invite the beta readers you trust and manage the whole round from one workspace." title="Keep your readers separate and their feedback together.">
          Start your beta round
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
