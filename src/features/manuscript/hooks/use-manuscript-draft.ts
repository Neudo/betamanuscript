"use client";

import { useCallback, useState } from "react";
import { initialManuscriptDraft } from "@/features/manuscript/data/create-manuscript";
import type { ManuscriptDraft } from "@/features/manuscript/types";

export function useManuscriptDraft(initialDraft?: Partial<ManuscriptDraft>) {
  const [draft, setDraft] = useState<ManuscriptDraft>(() => ({ ...initialManuscriptDraft, ...initialDraft }));
  const updateDraft = useCallback((patch: Partial<ManuscriptDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);
  const reset = useCallback(() => setDraft(initialManuscriptDraft), []);
  return { draft, updateDraft, reset };
}
