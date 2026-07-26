"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSurvey,
  getManuscriptSurveys,
  saveSurvey,
  updateSurveyStatus,
} from "@/features/surveys/api/surveys";
import { surveyKeys } from "@/features/surveys/query-keys";
import type { SurveyStatus } from "@/features/surveys/types";

export function useManuscriptSurveys(manuscriptId: string | null) {
  return useQuery({
    enabled: Boolean(manuscriptId),
    queryFn: () => getManuscriptSurveys(manuscriptId!),
    queryKey: surveyKeys.manuscript(manuscriptId ?? "none"),
    staleTime: 30_000,
  });
}

function useInvalidateSurveys(manuscriptId: string | null) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: surveyKeys.manuscript(manuscriptId ?? "none"),
    });
  };
}

export function useCreateSurvey(manuscriptId: string | null) {
  const invalidate = useInvalidateSurveys(manuscriptId);

  return useMutation({
    mutationFn: createSurvey,
    onSuccess: invalidate,
  });
}

export function useSaveSurvey(manuscriptId: string | null) {
  const invalidate = useInvalidateSurveys(manuscriptId);

  return useMutation({
    mutationFn: saveSurvey,
    onSuccess: invalidate,
  });
}

export function useUpdateSurveyStatus(manuscriptId: string | null) {
  const invalidate = useInvalidateSurveys(manuscriptId);

  return useMutation({
    mutationFn: (input: { status: SurveyStatus; surveyId: string }) => updateSurveyStatus(input),
    onSuccess: invalidate,
  });
}
