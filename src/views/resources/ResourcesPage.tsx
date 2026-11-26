import { BODY, CARD, MONO, OXBLOOD_TEXT, WARM } from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import { CopyQuestionnaire } from "@/views/resources/CopyQuestionnaire";
import {
  BreadcrumbJsonLd,
  Breadcrumbs,
  FinalCta,
  RelatedLinks,
  UseCaseHero,
  UseCasePageFrame,
} from "@/views/use-cases/components/UseCaseShared";

const questionnaires = [
  {
    id: "chapter-check-in",
    label: "01 / Before the reveal",
    title: "Chapter check-in",
    instructions: "Place this after the last chapter before a major reveal. Ask readers to answer before they turn the page.",
    questions: [
      "Right now, what do you think the character risks if they use this power again?",
      "What moment in this chapter gave you that impression?",
      "What question are you carrying into the next chapter?",
    ],
  },
  {
    id: "end-of-book",
    label: "02 / After the payoff",
    title: "End-of-book questionnaire",
    instructions: "Pick the questions that fit your draft. Ask for a chapter or scene reference wherever readers can remember one.",
    questions: [
      "When did you first understand what using the power would cost?",
      "Which earlier detail took on a new meaning after the reveal?",
      "Where did you have to stop and work out how the world worked?",
      "Which scene made you most want to read on, and where did that feeling fade?",
      "Which character choice felt hardest to believe? Point to the moment.",
      "For romantasy: when did the relationship first change what you thought the character would risk?",
    ],
  },
];

export function ResourcesPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/resources", label: "Resources" },
  ];

  return (
    <UseCasePageFrame>
      <main>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <div className="mx-auto max-w-6xl px-6 pt-8 md:px-12">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <UseCaseHero
          title="Fantasy Beta Reader Questionnaire"
          actions={[
            { href: "#questionnaires", label: "Get the questions", primary: true },
            { href: "#read-the-answers", label: "See how to use the answers" },
          ]}
        >
          <p>Find out where readers lost the thread, what they understood about your world, and whether the big reveal paid off. Copy these two short questionnaires for your next fantasy or romantasy beta round. No signup needed.</p>
        </UseCaseHero>

        <section id="questionnaires" className="scroll-mt-28 border-b border-foreground/10 px-6 py-16 md:px-12 md:py-24" style={{ background: WARM }} aria-labelledby="questionnaires-title">
          <div className="mx-auto max-w-6xl">
            <Heading id="questionnaires-title" level={2}>Ask once before the reveal, once after.</Heading>
            <div className="mt-9 grid gap-4 lg:grid-cols-2">
              {questionnaires.map(({ id, label, title, instructions, questions }) => (
                <article key={id} aria-labelledby={`${id}-title`} className="border border-foreground/15 p-6 sm:p-8" style={{ background: CARD }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: OXBLOOD_TEXT, fontFamily: MONO }}>{label}</p>
                  <Heading level={3} id={`${id}-title`} className="mt-4">{title}</Heading>
                  <p className="mt-3 text-sm leading-6" style={{ color: BODY }}>{instructions}</p>
                  <CopyQuestionnaire id={id} text={`${title}\n\n${instructions}\n\n${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}`} />
                  <ol id={id} className="mt-6 list-decimal space-y-3 border-t border-foreground/10 pl-5 pt-5 text-sm leading-6" style={{ color: BODY }}>
                    {questions.map((question) => <li key={question}>{question}</li>)}
                  </ol>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="read-the-answers" className="scroll-mt-28 px-6 py-16 md:px-12 md:py-24" aria-labelledby="answers-title">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Heading id="answers-title" level={2} className="max-w-md text-balance">Was the mystery working, or were readers lost?</Heading>
            <div className="max-w-2xl space-y-4 text-base leading-7" style={{ color: BODY }}>
              <p>Compare what readers believed before the reveal with what they say afterward. If they misread a clue but then recognize it and feel the payoff was fair, you may already have the right amount of information on the page.</p>
              <p>If several readers still can’t explain what the magic cost after the reveal, find the first place their answers diverge. Try clarifying one earlier clue rather than explaining the whole system. Ask readers which detail changed their interpretation on the next pass.</p>
            </div>
          </div>
        </section>

        <RelatedLinks items={[
          { href: "/use-cases/beta-reader-surveys", title: "Use beta reader surveys", description: "Keep end-of-chapter and full-manuscript answers with the draft readers are responding to." },
          { href: "/use-cases/organize-beta-reader-feedback#worked-example", title: "Turn feedback into a revision plan", description: "See how to weigh conflicting feedback in a worked example from The Salt Orchard." },
          { href: "/use-cases/manage-multiple-beta-readers", title: "Manage multiple beta readers", description: "Keep reactions independent so you can tell which issues several readers noticed on their own." },
        ]} />
        <FinalCta title="Ready to share your draft?" description="Invite your readers and keep their annotations and answers together. The Free plan has room for both surveys on this page.">
          Start your beta round
        </FinalCta>
      </main>
    </UseCasePageFrame>
  );
}
