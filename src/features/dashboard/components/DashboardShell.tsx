"use client";

import { Menu } from "lucide-react";
import { PropsWithChildren, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AuthenticatedAccount } from "@/features/account/types";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

export function DashboardShell({
  account,
  children,
}: PropsWithChildren<{ account: AuthenticatedAccount }>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background md:grid md:h-screen md:grid-cols-[220px_minmax(0,1fr)] md:overflow-hidden">
      <div className="hidden h-screen md:block">
        <WorkspaceSidebar account={account} />
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
            <SheetTitle className="sr-only">Writer navigation</SheetTitle>
            <WorkspaceSidebar
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
