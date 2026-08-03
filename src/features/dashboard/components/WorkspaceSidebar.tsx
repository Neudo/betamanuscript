"use client";

import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutGrid,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { WorkspaceAccountMenu } from "@/features/account/components/WorkspaceAccountMenu";
import { canRead, canWrite } from "@/features/account/domain/user-role";
import type { AuthenticatedAccount } from "@/features/account/types";
import { ManuscriptSwitcher } from "@/features/manuscript/components/ManuscriptSwitcher";
import { DraftVersionSwitcher } from "@/features/manuscript/components/DraftVersionSwitcher";
import { ManuscriptSettingsDialog } from "@/features/manuscript/components/ManuscriptSettingsDialog";
import { useManuscript } from "@/features/manuscript/hooks/use-manuscripts";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { cn } from "@/lib/utils";

const writerNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/manuscript", label: "Manuscript", icon: FileText },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/readers", label: "Readers", icon: Users },
  { href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
];

const readerNavItems = [
  { href: "/reader", label: "Reading list", icon: BookOpen },
  { href: "/reader/surveys", label: "Sent surveys", icon: ClipboardCheck },
];

type WorkspaceSidebarProps = {
  account: AuthenticatedAccount;
  onNavigate?: () => void;
};

export function WorkspaceSidebar({ account, onNavigate }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const selectedVersionId = searchParams.get("versionId");
  const manuscriptQuery = useManuscript(selectedManuscriptId, selectedVersionId);
  const manuscript = manuscriptQuery.data;
  const canAccessReaderWorkspace = account.role !== null && canRead(account.role);
  const canAccessWriterWorkspace = account.role === "super_admin"
    || (account.role !== null && canWrite(account.role));
  const isReaderRoute = pathname.startsWith("/reader");
  const settingsHref = isReaderRoute ? "/reader/settings" : withSelectedManuscript("/dashboard/settings");

  function withSelectedManuscript(href: string) {
    if (!selectedManuscriptId) return href;

    const [path, query = ""] = href.split("?");
    const nextSearchParams = new URLSearchParams(query);
    nextSearchParams.set("manuscriptId", selectedManuscriptId);
    if (selectedVersionId) nextSearchParams.set("versionId", selectedVersionId);
    return `${path}?${nextSearchParams.toString()}`;
  }

  function handleVersionChange(versionId: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("versionId", versionId);
    nextSearchParams.delete("chapterId");
    nextSearchParams.delete("annotationId");
    nextSearchParams.delete("generalCommentId");
    router.replace(`${pathname}?${nextSearchParams.toString()}`, { scroll: false });
    onNavigate?.();
  }

  function handleManuscriptDeleted() {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("manuscriptId");
    nextSearchParams.delete("versionId");
    nextSearchParams.delete("chapterId");
    nextSearchParams.delete("annotationId");
    nextSearchParams.delete("generalCommentId");
    const queryString = nextSearchParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    onNavigate?.();
  }

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-foreground/10 bg-sidebar text-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-foreground/10 px-5">
        <BrandLogo
          href={withSelectedManuscript("/dashboard")}
          ariaLabel="BetaManuscript dashboard"
          priority
          imageClassName="h-10"
        />
        <div className="ml-auto">
          <NotificationCenter profileId={account.id} />
        </div>
      </div>

      {canAccessWriterWorkspace ? (
        <ManuscriptSwitcher
          accountPlan={account.plan}
          onNavigate={onNavigate}
        />
      ) : null}

      {canAccessWriterWorkspace && manuscript ? (
        <div className="mx-3 mb-3">
          <p className="mb-2 px-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Current draft
          </p>
          <DraftVersionSwitcher
            activeVersionId={manuscript.version?.id ?? null}
            className="w-full"
            onVersionChange={handleVersionChange}
            versions={manuscript.versions}
          />
          <ManuscriptSettingsDialog
            accountPlan={account.plan}
            manuscript={manuscript}
            onDeleted={handleManuscriptDeleted}
            triggerClassName="mt-2 w-full"
            triggerLabel="Edit manuscript"
          />
          <div className="mt-3 border-t border-foreground/10" />
        </div>
      ) : null}

      <nav className="mt-2 flex-1 space-y-0.5 px-3" aria-label="Workspace navigation">
        {canAccessWriterWorkspace ? writerNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={withSelectedManuscript(item.href)}
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
        }) : null}
        {canAccessReaderWorkspace ? (
          <div className={cn(canAccessWriterWorkspace && "mt-3 border-t border-foreground/10 pt-3")}>
            {readerNavItems.map((item) => {
              const isActive = item.href === "/reader"
                ? pathname === "/reader" || (pathname.startsWith("/reader/") && !pathname.startsWith("/reader/settings") && !pathname.startsWith("/reader/surveys"))
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
          </div>
        ) : null}
      </nav>

      <div className="space-y-0.5 border-t border-foreground/10 px-3 pb-4 pt-3">
        <ThemeToggle label className="mb-2 h-8 w-full justify-start border-foreground/10 px-3 text-muted-foreground hover:text-foreground" />
        <Button asChild variant="ghost" className={cn("h-auto w-full justify-start border-l-2 border-transparent px-3 py-2 text-[11px] text-muted-foreground", pathname.startsWith(settingsHref) && "border-l-primary bg-foreground/[0.07] text-foreground")} size="sm">
          <Link href={settingsHref} onClick={onNavigate}>
            <Settings className="h-3 w-3" strokeWidth={1.5} />
            Settings
          </Link>
        </Button>

        <div className="mt-1 border-t border-foreground/10 pt-3">
          <WorkspaceAccountMenu
            account={account}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </aside>
  );
}
