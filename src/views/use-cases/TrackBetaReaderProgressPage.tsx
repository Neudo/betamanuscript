import { CheckCheck, CircleDotDashed, MessageSquareText } from "lucide-react";

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

const progressSignals = [
  {
    Icon: CircleDotDashed,
    detail: "See which invitations are still pending and which readers have started the beta round.",
    title: "The round has started",
  },
  {
    Icon: CheckCheck,
    detail: "See when a reader has completed their round, while each reader can continue at their own pace.",
    title: "The round is complete",
  },
  {
    Icon: MessageSquareText,
    detail: "See feedback activity alongside reader status instead of treating progress and reactions as separate follow-ups.",
    title: "Feedback is arriving",
  },
] as const;

export function TrackBetaReaderProgressPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/use-cases/track-beta-reader-progress", label: "Track beta reader progress" },
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
          title="Know where your beta readers are without chasing them for updates."
        >
          <p>See who has started, who has completed their round, and where feedback is already coming in—without turning a beta read into a stream of manual check-ins.</p>
        </UseCaseHero>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">Progress should clarify the round, not pressure the reader.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: BODY }}>
              <p>With several beta readers, it is easy to lose sight of the round: one reader has not opened the invitation, another is reading, and a third has already sent feedback. Repeatedly asking for updates adds work for everyone without improving the feedback.</p>
              <p>BetaManuscript keeps reader status and feedback activity in the same overview, so you can understand how the round is moving before you plan a follow-up or begin reviewing what has arrived.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <Heading level={2} className="max-w-xl text-balance">See the signals that matter in one reader overview.</Heading>
            <div className="mt-12 grid gap-px border md:grid-cols-3" style={{ background: "hsl(var(--ink) / 0.12)", borderColor: "hsl(var(--ink) / 0.12)" }}>
              {progressSignals.map((signal, index) => (
                <article key={signal.title} className="min-h-full p-6 sm:p-7" style={{ background: index === 1 ? CARD : PAPER }}>
                  <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                    <signal.Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <Heading level={3} className="mt-8 text-balance">{signal.title}</Heading>
                  <p className="mt-4 text-sm leading-6" style={{ color: BODY }}>{signal.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: EDITORIAL_DARK, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">Different readers, different pace.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
              <p>A reader who takes longer is not necessarily less engaged, and a completed round does not tell you whether the feedback is useful. Progress is context for your beta round, not a score for the people helping you.</p>
              <p>Use it to know when it makes sense to follow up, when enough feedback has arrived to start reviewing it, and when readers still need time to finish in their own way.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-4xl">
            <Heading level={2} className="max-w-2xl text-balance">Reader progress, without the guesswork</Heading>
            <div className="mt-12">
              <FaqList items={[
                {
                  question: "What reader progress can I see?",
                  answer: <p>The reader overview shows whether an invitation is pending, whether a reader has started, whether they have completed the round, and their feedback activity.</p>,
                },
                {
                  question: "Can beta readers read at their own pace?",
                  answer: <p>Yes. Readers can return to the manuscript later, with their reading progress saved for them. The overview gives the author context without asking readers to work on a shared schedule.</p>,
                },
                {
                  question: "Does completing a round mean a reader has submitted feedback?",
                  answer: <p>No. Reading status and feedback activity are related but distinct signals. The overview lets you see both instead of assuming that one proves the other.</p>,
                },
                {
                  question: "Can I track several beta readers at once?",
                  answer: <p>Yes. BetaManuscript keeps the readers in the same beta round while showing each person&apos;s status and feedback activity separately.</p>,
                },
                {
                  question: "Is progress a measure of reader quality?",
                  answer: <p>No. It simply helps you understand the state of the beta round. The author decides when and whether to follow up.</p>,
                },
              ]} />
            </div>
          </div>
        </section>

        <RelatedLinks items={[
          {
            description: "Give several readers independent places to read and react in the same round.",
            href: "/use-cases/manage-multiple-beta-readers",
            title: "Manage multiple beta readers",
          },
          {
            description: "Choose private invitations or a shareable reading page for your draft.",
            href: "/use-cases/share-manuscript-with-beta-readers",
            title: "Share a manuscript with beta readers",
          },
          {
            description: "Keep passage reactions and broader answers connected before revision.",
            href: "/use-cases/organize-beta-reader-feedback",
            title: "Organize beta reader feedback",
          },
        ]} />

        <FinalCta description="See the state of your beta round, then give readers the time and context they need to respond." title="See your beta round in one place.">
          Start your beta round
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
