"use client";

import { MessageSquarePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type MobileAnnotationActionBarProps = {
  onAnnotate: () => void;
  onDismiss: () => void;
};

/**
 * Keeps the browser's native text-selection controls available on touch
 * devices, then gives the reader an explicit way to turn that selection into
 * an annotation.
 */
export function MobileAnnotationActionBar({
  onAnnotate,
  onDismiss,
}: MobileAnnotationActionBarProps) {
  return (
    <div
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-3 border border-primary/25 bg-card p-2.5 shadow-[0_12px_32px_rgba(28,24,18,0.18)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3"
      role="status"
    >
      <div className="min-w-0 pl-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Passage selected</p>
        <p className="truncate text-xs font-medium">Ready to add feedback</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          aria-label="Clear selected passage"
          className="h-9 w-9 rounded-none"
          onClick={onDismiss}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button className="h-9 rounded-none px-3 text-xs" onClick={onAnnotate} size="sm" type="button">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Annotate
        </Button>
      </div>
    </div>
  );
}
