"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PlanRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
};

export function PlanRequiredDialog({
  open,
  onOpenChange,
  onNavigate,
}: PlanRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] gap-0 border-foreground/10 bg-card p-0 shadow-[0_24px_64px_rgba(28,24,18,0.18)] sm:rounded-none">
        <DialogHeader className="border-b border-foreground/[0.08] px-7 pb-5 pt-7 text-left">
          <p className="font-mono text-[9px] uppercase tracking-widest text-primary">
            Pro plan
          </p>
          <DialogTitle className="pt-1 text-lg tracking-normal">
            Add unlimited manuscripts
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-6">
            Your free plan is limited to one manuscript. Upgrade to Pro to create
            and manage additional projects.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2 bg-sidebar px-7 py-4 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Not now
            </Button>
          </DialogClose>
          <Button asChild size="sm">
            <Link
              href="/dashboard/settings?section=plan"
              onClick={() => {
                onOpenChange(false);
                onNavigate?.();
              }}
            >
              View Pro plan
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
