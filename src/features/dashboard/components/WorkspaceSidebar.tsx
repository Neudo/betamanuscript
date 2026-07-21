"use client";

import {
  BookOpen,
  BookOpenText,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  canRead,
  getRoleLabel,
  roleOptions,
  type UserRole,
} from "@/features/account/domain/user-role";
import { cn } from "@/lib/utils";
import { currentUser, manuscript } from "../data/mock-dashboard";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/manuscript", label: "Manuscript", icon: FileText },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/readers", label: "Readers", icon: Users },
  { href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
];

type WorkspaceSidebarProps = {
  onNavigate?: () => void;
};

export function WorkspaceSidebar({ onNavigate }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("both");

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-foreground/10 bg-sidebar text-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-foreground/10 px-5">
        <BookOpen className="h-[15px] w-[15px] text-primary" strokeWidth={1.5} aria-hidden="true" />
        <Link href="/dashboard" className="text-base font-semibold tracking-normal">
          BetaQuill
        </Link>
      </div>

      <div className="mx-3 mb-2 mt-4 border border-foreground/10 bg-card/60 px-3 py-2.5">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Manuscript
        </p>
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-xs font-medium leading-snug">{manuscript.title}</p>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
          {manuscript.draft} · 9 ch · 5 readers
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
        <Button variant="ghost" className="h-auto w-full justify-start px-3 py-2 text-[11px] text-muted-foreground" size="sm">
          <Plus className="h-3 w-3" strokeWidth={1.5} />
          New manuscript
        </Button>
        <Button asChild variant="ghost" className={cn("h-auto w-full justify-start border-l-2 border-transparent px-3 py-2 text-[11px] text-muted-foreground", pathname.startsWith("/dashboard/settings") && "border-l-primary bg-foreground/[0.07] text-foreground")} size="sm">
          <Link href="/dashboard/settings" onClick={onNavigate}>
            <Settings className="h-3 w-3" strokeWidth={1.5} />
            Settings
          </Link>
        </Button>

        <div className="mt-1 border-t border-foreground/10 pt-3">
          <div className="mb-2.5 flex items-center gap-2 px-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
              {currentUser.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-medium">{currentUser.name}</span>
              <span className="block truncate font-mono text-[9px] text-muted-foreground">{currentUser.email}</span>
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-auto w-full justify-between border-foreground/15 bg-transparent px-2.5 py-1.5 text-[10px] font-normal">
                <span className="font-mono text-[9px] text-muted-foreground">Role</span>
                <span className="ml-auto">{getRoleLabel(role)}</span>
                <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Workspace access</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roleOptions.map((option) => (
                <DropdownMenuItem key={option.value} onSelect={() => setRole(option.value)} className="flex-col items-start gap-0.5">
                  <span>{option.label}</span>
                  <span className="text-[10px] text-muted-foreground">{option.description}</span>
                </DropdownMenuItem>
              ))}
              {canRead(role) ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/reader" onClick={onNavigate} className="text-primary">
                      <BookOpenText className="h-3.5 w-3.5" />
                      Switch to reader view
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
