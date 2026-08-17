import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  href: string;
  label: string;
};

export function Breadcrumbs({
  className,
  items,
}: {
  className?: string;
  items: readonly BreadcrumbItem[];
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : null}
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link href={item.href} className="transition-opacity hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
