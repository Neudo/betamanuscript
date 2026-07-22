import Link from "next/link";
import type { ReactNode } from "react";

type AuthScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthScreen({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthScreenProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]">
      <section className="dashboard-grid hidden border-r p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="font-display text-2xl font-semibold">
          BetaManuscript
        </Link>
        <div className="max-w-xl space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            One account, two workspaces
          </p>
          <h1 className="font-display text-6xl leading-[0.98]">
            Write with clarity. Read with purpose.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            Move between manuscript revisions and focused beta reading without
            losing the context behind the feedback.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Structured feedback for serious revisions.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-3">
            <Link href="/" className="font-display text-xl font-semibold lg:hidden">
              BetaManuscript
            </Link>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <h2 className="font-display text-4xl">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
          <div className="text-sm text-muted-foreground">{footer}</div>
        </div>
      </section>
    </main>
  );
}
