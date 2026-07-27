import { BrandLogo } from "@/components/BrandLogo";

import { AccountPersonalizationForm } from "./AccountPersonalizationForm";
import type { UserRole } from "../domain/user-role";

export function AccountPersonalizationScreen({
  accountId,
  initialDisplayName,
  initialRole,
  next,
}: {
  accountId: string;
  initialDisplayName: string;
  initialRole: UserRole;
  next: string | null;
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <BrandLogo href="/" priority imageClassName="h-8" />
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Account setup
          </p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="max-w-2xl space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
            Welcome to BetaManuscript
          </p>
          <h1 className="font-display text-5xl leading-[0.98] sm:text-6xl">
            Make this account yours.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Choose how you&apos;ll use BetaManuscript and set the name readers and writers will see.
          </p>
        </div>

        <div className="mt-12 w-full border bg-card p-5 paper-shadow sm:p-8 lg:p-10">
          <AccountPersonalizationForm
            accountId={accountId}
            initialDisplayName={initialDisplayName}
            initialRole={initialRole}
            next={next}
          />
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          You can change these details later in account settings.
        </p>
      </section>
    </main>
  );
}
