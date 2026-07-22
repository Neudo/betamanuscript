"use client";

import { BookOpen, List, Menu } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren, useState } from "react";

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
  return (
    <aside className="flex h-full w-[220px] flex-col border-r border-foreground/10 bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-foreground/10 px-5">
        <BookOpen className="h-[15px] w-[15px] text-primary" strokeWidth={1.5} />
        <Link href="/reader" className="text-base font-semibold">
          BetaManuscript
        </Link>
      </div>
      <nav className="flex-1 p-3" aria-label="Reader workspace">
        <Link
          href="/reader"
          onClick={onNavigate}
          className="flex h-10 items-center gap-3 border-l-2 border-l-primary bg-foreground/[0.07] px-3 text-sm"
        >
          <List className="h-4 w-4" strokeWidth={1.5} />
          Reading list
        </Link>
      </nav>
      <div className="border-t border-foreground/10 p-3 pb-4">
        <WorkspaceAccountMenu
          account={account}
          currentWorkspace="reader"
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
        <span className="text-base font-semibold">BetaManuscript</span>
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
      <main className="min-w-0 md:h-screen md:overflow-y-auto">{children}</main>
    </div>
  );
}
