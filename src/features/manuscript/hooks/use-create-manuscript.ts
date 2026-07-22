"use client";

import { useCallback, useMemo, useState } from "react";

import {
  initialManuscriptDraft,
  manuscriptWizardSteps,
} from "@/features/manuscript/data/create-manuscript";
import type {
  ManuscriptDraft,
  ManuscriptWizardStep,
} from "@/features/manuscript/types";

export function useCreateManuscript() {
  const [step, setStep] = useState<ManuscriptWizardStep>("info");
  const [draft, setDraft] = useState<ManuscriptDraft>(initialManuscriptDraft);

  const stepIndex = manuscriptWizardSteps.findIndex((item) => item.id === step);
  const canContinue = useMemo(() => {
    if (step === "info") return draft.title.trim().length > 0;
    if (step === "structure") return draft.chapters > 0;
    return true;
  }, [draft.chapters, draft.title, step]);

  const updateDraft = useCallback((patch: Partial<ManuscriptDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((current) => {
      const index = manuscriptWizardSteps.findIndex((item) => item.id === current);
      return manuscriptWizardSteps[Math.min(index + 1, manuscriptWizardSteps.length - 1)].id;
    });
  }, []);

  const previousStep = useCallback(() => {
    setStep((current) => {
      const index = manuscriptWizardSteps.findIndex((item) => item.id === current);
      return manuscriptWizardSteps[Math.max(index - 1, 0)].id;
    });
  }, []);

  const reset = useCallback(() => {
    setStep("info");
    setDraft(initialManuscriptDraft);
  }, []);

  return {
    step,
    stepIndex,
    draft,
    canContinue,
    updateDraft,
    nextStep,
    previousStep,
    reset,
  };
}
