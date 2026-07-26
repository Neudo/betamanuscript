"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AccountPlan } from "@/features/account/types";
import { CreateManuscriptDialog } from "@/features/manuscript/components/CreateManuscriptDialog";
import { PlanRequiredDialog } from "@/features/manuscript/components/PlanRequiredDialog";
import { useManuscripts } from "@/features/manuscript/hooks/use-manuscripts";
import { cn } from "@/lib/utils";

type ManuscriptSwitcherProps = {
  accountPlan: AccountPlan;
  onNavigate?: () => void;
};

export function ManuscriptSwitcher({
  accountPlan,
  onNavigate,
}: ManuscriptSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const manuscriptsQuery = useManuscripts();
  const manuscripts = manuscriptsQuery.data ?? [];
  const selectedManuscriptId = searchParams.get("manuscriptId");
  const activeManuscript =
    manuscripts.find((item) => item.id === selectedManuscriptId) ?? manuscripts[0];
  const canCreateManuscript =
    accountPlan === "pro" ||
    (!manuscriptsQuery.isLoading && manuscripts.length === 0);

  useEffect(() => {
    if (selectedManuscriptId || !activeManuscript) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("manuscriptId", activeManuscript.id);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    });
  }, [activeManuscript, pathname, router, searchParams, selectedManuscriptId]);

  function selectManuscript(manuscriptId: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("manuscriptId", manuscriptId);
    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    });
    onNavigate?.();
  }

  function handleAddNew() {
    if (canCreateManuscript) {
      setCreateOpen(true);
      return;
    }

    setPlanDialogOpen(true);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group mx-3 mb-2 mt-4 w-[calc(100%-1.5rem)] border border-foreground/10 bg-card/60 px-3 py-2.5 text-left outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar data-[state=open]:bg-card"
          >
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Manuscript
            </span>
            <span className="flex items-center justify-between gap-1">
              <span className="truncate text-xs font-medium leading-snug">
                {activeManuscript?.title ?? "No manuscript yet"}
              </span>
              <ChevronDown
                className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
            <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
              {activeManuscript
                ? `${activeManuscript.draft} · ${activeManuscript.chapters} ch · ${activeManuscript.readers} readers`
                : manuscriptsQuery.isLoading
                  ? "Loading your workspace…"
                  : "Create your first manuscript"}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-none border-foreground/10 bg-card p-1 shadow-[0_12px_32px_rgba(28,24,18,0.14)]"
        >
          <DropdownMenuLabel className="px-2 pb-1 pt-2 font-mono text-[9px] font-normal uppercase tracking-widest text-muted-foreground">
            Your manuscripts
          </DropdownMenuLabel>
          {manuscripts.map((item) => {
            const isActive = item.id === activeManuscript?.id;

            return (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => selectManuscript(item.id)}
                className="items-start rounded-none px-2 py-2.5 focus:bg-foreground/[0.05]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
                    {item.draft} · {item.chapters} ch
                  </span>
                </span>
                <Check
                  className={cn(
                    "mt-0.5 h-3.5 w-3.5 text-primary",
                    !isActive && "invisible",
                  )}
                  aria-hidden="true"
                />
              </DropdownMenuItem>
            );
          })}
          {manuscriptsQuery.isError ? (
            <p className="px-2 py-2 text-[11px] text-destructive">
              Manuscripts could not be loaded.
            </p>
          ) : null}
          {!manuscriptsQuery.isLoading && !manuscriptsQuery.isError && manuscripts.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-muted-foreground">
              Your first manuscript will appear here.
            </p>
          ) : null}
          <DropdownMenuSeparator className="bg-foreground/10" />
          <DropdownMenuItem
            disabled={manuscriptsQuery.isLoading || manuscriptsQuery.isError}
            onSelect={handleAddNew}
            className="rounded-none px-2 py-2.5 text-xs font-medium focus:bg-foreground/[0.05]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add new
            {accountPlan === "free" && !canCreateManuscript ? (
              <span className="ml-auto font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                Pro
              </span>
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateManuscriptDialog
        accountPlan={accountPlan}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={({ manuscriptId }) => selectManuscript(manuscriptId)}
      />
      <PlanRequiredDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        onNavigate={onNavigate}
      />
    </>
  );
}
