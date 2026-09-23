import { Link2, Mail, MessageSquareText } from "lucide-react";

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

const sharingOptions = [
  {
    Icon: Mail,
    detail: "Invite specific readers by email when you know exactly who should be part of the round.",
    title: "Private invitations",
  },
  {
    Icon: Link2,
    detail: "Enable a shareable reading page when a link is the better way to reach a wider group.",
    title: "A shareable reading page",
  },
  {
    Icon: MessageSquareText,
    detail: "Keep reading status and feedback connected to the same manuscript and beta-reading round.",
    title: "One connected round",
  },
] as const;

export function ShareManuscriptWithBetaReadersPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/use-cases/share-manuscript-with-beta-readers", label: "Share a manuscript with beta readers" },
  ];

  return (
    <UseCasePageFrame>
      <main>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <div className="mx-auto max-w-6xl px-6 pt-8 md:px-12"><Breadcrumbs items={breadcrumbs} /></div>
        <UseCaseHero
          actions={[
            { href: "/signup", label: "Start sharing your draft", primary: true },
            { href: "/how-it-works", label: "See how it works" },
          ]}
          title="Share your manuscript with beta readers without sending loose files."
        >
          <p>Choose private invitations or a shareable reading page, then keep every reader&apos;s access, progress, and feedback connected to the same beta round.</p>
        </UseCaseHero>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} className="max-w-md text-balance">Two ways to share a draft.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: BODY }}>
              <p>Some beta rounds are private: you know each reader and want to invite them individually. Others work better through a reading link that a wider group can open. BetaManuscript supports both access paths within the same focused reading experience.</p>
              <p>Readers open the manuscript in their browser instead of receiving separate copies to manage. Their annotations, survey responses, and reading status stay connected to the manuscript as the round moves forward.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: WARM, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-6xl">
            <Heading level={2} className="max-w-xl text-balance">Choose access based on the round you are running.</Heading>
            <div className="mt-12 grid gap-px border md:grid-cols-3" style={{ background: "hsl(var(--ink) / 0.12)", borderColor: "hsl(var(--ink) / 0.12)" }}>
              {sharingOptions.map((option, index) => (
                <article key={option.title} className="min-h-full p-6 sm:p-7" style={{ background: index === 1 ? CARD : PAPER }}>
                  <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                    <option.Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <Heading level={3} className="mt-8 text-balance">{option.title}</Heading>
                  <p className="mt-4 text-sm leading-6" style={{ color: BODY }}>{option.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: EDITORIAL_DARK, borderColor: "hsl(var(--inverse-foreground) / 0.16)", color: INVERSE_FOREGROUND }}>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Heading level={2} tone="inverse" className="max-w-md text-balance">A link is access, not a lock.</Heading>
            </div>
            <div className="max-w-2xl space-y-5 text-base leading-7" style={{ color: INVERSE_FOREGROUND }}>
              <p>A shareable reading page gives anyone with the link access to read the draft. It can be disabled from the reader overview, but it should still be treated as a link that can be forwarded.</p>
              <p>Choose private invitations when you need to control exactly who receives access. Choose a shareable page when lowering the barrier to reading is more useful for the round.</p>
            </div>
          </div>
        </section>

        <section className="border-b px-6 py-20 md:px-12 md:py-28" style={{ background: PAPER, borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="mx-auto max-w-4xl">
            <Heading level={2} className="max-w-2xl text-balance">Sharing a manuscript with beta readers</Heading>
            <div className="mt-12">
              <FaqList items={[
                {
                  question: "Do beta readers need an account?",
                  answer: <p>Anyone with an enabled shareable reading link can read without an account. A free account is required when a reader wants to save feedback. Private invitations are accepted with a free account using the invited email address.</p>,
                },
                {
                  question: "Can I invite specific beta readers?",
                  answer: <p>Yes. Send private invitations by email when you know who should read the draft. You can also revoke an invitation from the reader overview.</p>,
                },
                {
                  question: "Can I share a reading link instead of inviting every reader?",
                  answer: <p>Yes. Enable a shareable reading page for the beta round and anyone with the link can open and read it. Feedback still requires a free account.</p>,
                },
                {
                  question: "Can I stop a shareable reading page?",
                  answer: <p>Yes. You can disable the shareable reading page from the reader overview. Readers with private invitations can still use those invitations.</p>,
                },
                {
                  question: "Does sharing keep reader feedback organized?",
                  answer: <p>Yes. Annotations, survey responses, reading status, and reader identity remain part of the same beta round instead of being spread across separate files and email threads.</p>,
                },
              ]} />
            </div>
          </div>
        </section>

        <RelatedLinks items={[
          {
            description: "Keep readers independent while you still see the whole round.",
            href: "/use-cases/manage-multiple-beta-readers",
            title: "Manage multiple beta readers",
          },
          {
            description: "See invitations, reader status, and feedback activity without manual check-ins.",
            href: "/use-cases/track-beta-reader-progress",
            title: "Track beta reader progress",
          },
          {
            description: "Bring every reaction back to its passage, chapter, reader, and tag.",
            href: "/use-cases/organize-beta-reader-feedback",
            title: "Organize beta reader feedback",
          },
        ]} />

        <FinalCta description="Bring your readers into one focused beta-reading workflow instead of rebuilding the round across shared files and scattered messages." title="Share your next draft with beta readers.">
          Start sharing your draft
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
