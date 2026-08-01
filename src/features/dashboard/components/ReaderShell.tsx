"use client";

import { ClipboardCheck, List, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WorkspaceAccountMenu } from "@/features/account/components/WorkspaceAccountMenu";
import type { AuthenticatedAccount } from "@/features/account/types";

function ReaderSidebar({
  account,
  onNavigate,
}: {
  account: AuthenticatedAccount;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-foreground/10 bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-foreground/10 px-5">
        <BrandLogo href="/reader" ariaLabel="BetaManuscript reader workspace" priority imageClassName="h-7" />
      </div>
      <nav className="flex-1 p-3" aria-label="Reader workspace">
        <Link
          href="/reader"
          onClick={onNavigate}
          className={`flex h-10 items-center gap-3 border-l-2 px-3 text-sm transition-colors ${
            pathname === "/reader"
              ? "border-l-primary bg-foreground/[0.07]"
              : "border-l-transparent hover:bg-foreground/[0.05]"
          }`}
        >
          <List className="h-4 w-4" strokeWidth={1.5} />
          Reading list
        </Link>
        <Link
          href="/reader/surveys"
          onClick={onNavigate}
          className={`mt-1 flex h-10 items-center gap-3 border-l-2 px-3 text-sm transition-colors ${
            pathname === "/reader/surveys"
              ? "border-l-primary bg-foreground/[0.07]"
              : "border-l-transparent hover:bg-foreground/[0.05]"
          }`}
        >
          <ClipboardCheck className="h-4 w-4" strokeWidth={1.5} />
          Sent surveys
        </Link>
      </nav>
      <div className="space-y-0.5 border-t border-foreground/10 px-3 pb-4 pt-3">
        <ThemeToggle label className="mb-2 h-8 w-full justify-start border-foreground/10 px-3 text-muted-foreground hover:text-foreground" />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className={`h-auto w-full justify-start border-l-2 border-transparent px-3 py-2 text-[11px] text-muted-foreground ${
            pathname.startsWith("/reader/settings") && "border-l-primary bg-foreground/[0.07] text-foreground"
          }`}
        >
          <Link href="/reader/settings" onClick={onNavigate}>
            <Settings className="h-3 w-3" strokeWidth={1.5} />
            Settings
          </Link>
        </Button>
        <WorkspaceAccountMenu
          account={account}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}

export function ReaderShell({
  account,
  children,
}: PropsWithChildren<{ account: AuthenticatedAccount }>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:grid md:h-screen md:grid-cols-[220px_minmax(0,1fr)] md:overflow-hidden">
      <div className="hidden h-screen md:block">
        <ReaderSidebar account={account} />
      </div>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-sidebar px-4 md:hidden">
        <BrandLogo href="/reader" ariaLabel="BetaManuscript reader workspace" imageClassName="h-7" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open navigation">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[220px] p-0">
              <SheetTitle className="sr-only">Reader navigation</SheetTitle>
              <ReaderSidebar
                account={account}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <main className="min-w-0 md:h-screen md:overflow-y-auto">{children}</main>
    </div>
  );
}
