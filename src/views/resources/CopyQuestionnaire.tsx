"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export function CopyQuestionnaire({ id, text }: { id: string; text: string }) {
  const [feedback, setFeedback] = useState("");

  async function copyQuestions() {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Copied.");
    } catch {
      setFeedback("Couldn’t copy automatically. Select the questions below to copy them.");
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        aria-controls={id}
        onClick={copyQuestions}
        className="editorial-action inline-flex min-h-11 items-center gap-2 border border-foreground/20 px-3 text-sm font-medium transition-colors hover:bg-foreground/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <Copy size={15} aria-hidden="true" />
        Copy questions
      </button>
      <span role="status" className="ml-3 text-sm">{feedback}</span>
    </div>
  );
}
