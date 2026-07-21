import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex min-h-[88px] flex-col gap-5 border-b border-foreground/10 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-[28px] font-medium leading-tight tracking-normal">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
