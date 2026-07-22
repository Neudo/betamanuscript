"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

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
import type {
  ManuscriptDraft,
  ManuscriptSummary,
} from "@/features/manuscript/types";
import { cn } from "@/lib/utils";

type ManuscriptSwitcherProps = {
  accountPlan: AccountPlan;
  initialManuscripts: ManuscriptSummary[];
  onNavigate?: () => void;
};

export function ManuscriptSwitcher({
  accountPlan,
  initialManuscripts,
  onNavigate,
}: ManuscriptSwitcherProps) {
  const [manuscripts, setManuscripts] = useState(initialManuscripts);
  const [activeId, setActiveId] = useState(initialManuscripts[0]?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const activeManuscript =
    manuscripts.find((item) => item.id === activeId) ?? manuscripts[0];

  function handleAddNew() {
    if (accountPlan === "pro") {
      setCreateOpen(true);
      return;
    }

    setPlanDialogOpen(true);
  }

  function handleCreate(draft: ManuscriptDraft) {
    const createdManuscript: ManuscriptSummary = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      draft: `Draft ${draft.draftNumber}`,
      chapters: draft.chapters,
      readers: 0,
    };

    setManuscripts((current) => [...current, createdManuscript]);
    setActiveId(createdManuscript.id);
  }

  if (!activeManuscript) return null;

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
                {activeManuscript.title}
              </span>
              <ChevronDown
                className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
            <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
              {activeManuscript.draft} · {activeManuscript.chapters} ch ·{" "}
              {activeManuscript.readers} readers
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
            const isActive = item.id === activeManuscript.id;

            return (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => setActiveId(item.id)}
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
          <DropdownMenuSeparator className="bg-foreground/10" />
          <DropdownMenuItem
            onSelect={handleAddNew}
            className="rounded-none px-2 py-2.5 text-xs font-medium focus:bg-foreground/[0.05]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add new
            {accountPlan === "free" ? (
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
        onCreate={handleCreate}
      />
      <PlanRequiredDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        onNavigate={onNavigate}
      />
    </>
  );
}
