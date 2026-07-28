"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cloneSurveys,
  createSurvey,
  deleteSurvey,
  getManuscriptSurveys,
  saveSurvey,
  updateSurveyStatus,
} from "@/features/surveys/api/surveys";
import { surveyKeys } from "@/features/surveys/query-keys";
import type { SurveyStatus } from "@/features/surveys/types";

export function useManuscriptSurveys(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  return useQuery({
    enabled: Boolean(manuscriptId),
    queryFn: () => getManuscriptSurveys(manuscriptId!, manuscriptVersionId),
    queryKey: surveyKeys.manuscript(manuscriptId ?? "none", manuscriptVersionId),
    staleTime: 30_000,
  });
}

function useInvalidateSurveys(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: surveyKeys.manuscript(manuscriptId ?? "none", manuscriptVersionId),
    });
  };
}

export function useCreateSurvey(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  const invalidate = useInvalidateSurveys(manuscriptId, manuscriptVersionId);

  return useMutation({
    mutationFn: createSurvey,
    onSuccess: invalidate,
  });
}

export function useCloneSurveys(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  const invalidate = useInvalidateSurveys(manuscriptId, manuscriptVersionId);

  return useMutation({
    mutationFn: cloneSurveys,
    onSuccess: invalidate,
  });
}

export function useSaveSurvey(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  const invalidate = useInvalidateSurveys(manuscriptId, manuscriptVersionId);

  return useMutation({
    mutationFn: saveSurvey,
    onSuccess: invalidate,
  });
}

export function useDeleteSurvey(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  const invalidate = useInvalidateSurveys(manuscriptId, manuscriptVersionId);

  return useMutation({
    mutationFn: deleteSurvey,
    onSuccess: invalidate,
  });
}

export function useUpdateSurveyStatus(
  manuscriptId: string | null,
  manuscriptVersionId: string | null = null,
) {
  const invalidate = useInvalidateSurveys(manuscriptId, manuscriptVersionId);

  return useMutation({
    mutationFn: (input: { status: SurveyStatus; surveyId: string }) => updateSurveyStatus(input),
    onSuccess: invalidate,
  });
}
