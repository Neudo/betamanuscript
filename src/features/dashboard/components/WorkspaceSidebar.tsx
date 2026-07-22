"use client";

import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutGrid,
  MessageSquare,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { WorkspaceAccountMenu } from "@/features/account/components/WorkspaceAccountMenu";
import type { AuthenticatedAccount } from "@/features/account/types";
import { CreateManuscriptDialog } from "@/features/manuscript/components/CreateManuscriptDialog";
import type { ManuscriptSummary } from "@/features/manuscript/types";
import { cn } from "@/lib/utils";
import { manuscript } from "../data/mock-dashboard";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/manuscript", label: "Manuscript", icon: FileText },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/readers", label: "Readers", icon: Users },
  { href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
];

type WorkspaceSidebarProps = {
  account: AuthenticatedAccount;
  onNavigate?: () => void;
};

export function WorkspaceSidebar({ account, onNavigate }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const [activeManuscript, setActiveManuscript] = useState<ManuscriptSummary>({
    title: manuscript.title,
    draft: manuscript.draft,
    chapters: 9,
    readers: 5,
  });

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-foreground/10 bg-sidebar text-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-foreground/10 px-5">
        <BookOpen className="h-[15px] w-[15px] text-primary" strokeWidth={1.5} aria-hidden="true" />
        <Link href="/dashboard" className="text-base font-semibold tracking-normal">
          BetaManuscript
        </Link>
      </div>

      <div className="mx-3 mb-2 mt-4 border border-foreground/10 bg-card/60 px-3 py-2.5">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Manuscript
        </p>
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-xs font-medium leading-snug">{activeManuscript.title}</p>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
          {activeManuscript.draft} · {activeManuscript.chapters} ch · {activeManuscript.readers} readers
        </p>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3" aria-label="Writer workspace">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04]",
                isActive && "border-l-primary bg-foreground/[0.07] text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-foreground/10 px-3 pb-4 pt-3">
        <CreateManuscriptDialog
          onCreate={(draft) => setActiveManuscript({
            title: draft.title.trim(),
            draft: `Draft ${draft.draftNumber}`,
            chapters: draft.chapters,
            readers: 0,
          })}
        >
          <Button variant="ghost" className="h-auto w-full justify-start px-3 py-2 text-[11px] text-muted-foreground" size="sm">
            <Plus className="h-3 w-3" strokeWidth={1.5} />
            New manuscript
          </Button>
        </CreateManuscriptDialog>
        <Button asChild variant="ghost" className={cn("h-auto w-full justify-start border-l-2 border-transparent px-3 py-2 text-[11px] text-muted-foreground", pathname.startsWith("/dashboard/settings") && "border-l-primary bg-foreground/[0.07] text-foreground")} size="sm">
          <Link href="/dashboard/settings" onClick={onNavigate}>
            <Settings className="h-3 w-3" strokeWidth={1.5} />
            Settings
          </Link>
        </Button>

        <div className="mt-1 border-t border-foreground/10 pt-3">
          <WorkspaceAccountMenu
            account={account}
            currentWorkspace="writer"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </aside>
  );
}
