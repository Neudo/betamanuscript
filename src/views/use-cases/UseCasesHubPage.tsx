import { ArrowRight, FolderTree, UsersRound } from "lucide-react";
import Link from "next/link";

import { BODY, CARD, INK, OXBLOOD_TEXT, PAPER, WARM } from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import {
  BreadcrumbJsonLd,
  Breadcrumbs,
  UseCasePageFrame,
} from "@/views/use-cases/components/UseCaseShared";

const useCases = [
  {
    Icon: UsersRound,
    description: "Invite your readers into one beta-reading workspace, follow their progress, and keep each person’s feedback organized without juggling separate documents.",
    href: "/use-cases/manage-multiple-beta-readers",
    label: "Manage multiple beta readers",
    title: "Manage multiple beta readers",
  },
  {
    Icon: FolderTree,
    description: "Keep annotations, tags, surveys, chapters, and reader reactions connected so recurring issues are easier to identify when revision begins.",
    href: "/use-cases/organize-beta-reader-feedback",
    label: "Organize beta reader feedback",
    title: "Organize beta reader feedback",
  },
] as const;

export function UseCasesHubPage() {
  const breadcrumbs = [
    { href: "/", label: "Home" },
    { href: "/use-cases", label: "Use cases" },
  ];

  return (
    <UseCasePageFrame>
      <main>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <section className="relative isolate overflow-hidden border-b px-6 pb-20 pt-8 md:px-12 md:pb-28 md:pt-10" style={{ borderColor: "hsl(var(--ink) / 0.1)" }}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-75" style={{ backgroundImage: "radial-gradient(circle at 88% 16%, hsl(var(--forest) / 0.12), transparent 23rem), radial-gradient(circle at 2% 90%, hsl(var(--oxblood) / 0.1), transparent 25rem)" }} />
          <div className="mx-auto max-w-6xl">
            <Breadcrumbs items={breadcrumbs} />
            <div className="mt-16 max-w-3xl">
              <Heading level={1} className="text-balance">
                A better workflow for every stage of your beta reading round.
              </Heading>
              <p className="mt-7 max-w-2xl text-pretty text-base leading-8 sm:text-lg" style={{ color: BODY }}>
                BetaManuscript helps authors manage their own beta readers, keep manuscript feedback organized, and see which reactions deserve attention before revision.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28" style={{ background: WARM }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 lg:grid-cols-2">
              {useCases.map((useCase, index) => (
                <article key={useCase.href} className="flex min-h-full flex-col border p-5 sm:p-7" style={{ background: index === 0 ? PAPER : CARD, borderColor: "hsl(var(--ink) / 0.16)" }}>
                  <span className="flex h-10 w-10 items-center justify-center border" style={{ borderColor: "hsl(var(--ink) / 0.14)", color: OXBLOOD_TEXT }}>
                    <useCase.Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <Heading level={2} size="section" className="mt-8 max-w-md text-balance">
                    {useCase.title}
                  </Heading>
                  <p className="mt-5 max-w-lg text-base leading-7" style={{ color: BODY }}>{useCase.description}</p>
                  <Link href={useCase.href} className="mt-auto inline-flex pt-8 items-center gap-1.5 text-sm font-medium underline decoration-1 underline-offset-4 transition-opacity hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" style={{ color: INK }}>
                    {useCase.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </UseCasePageFrame>
  );
}
