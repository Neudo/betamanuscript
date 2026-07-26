"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createManuscriptAnnotationTag,
  getManuscriptAnnotationTags,
  setManuscriptAnnotationTagActive,
  updateManuscriptAnnotationTagColor,
} from "@/features/feedback/api/feedback-tags";
import { feedbackKeys } from "@/features/feedback/query-keys";
import { dashboardKeys } from "@/features/dashboard/query-keys";
import { manuscriptKeys } from "@/features/manuscript/query-keys";
import { readingKeys } from "@/features/reading/hooks/use-reading";

function useInvalidateAnnotationTagData() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all }),
      queryClient.invalidateQueries({ queryKey: manuscriptKeys.all }),
      queryClient.invalidateQueries({ queryKey: readingKeys.all }),
    ]);
  };
}

export function useManuscriptAnnotationTags(manuscriptId: string | null) {
  return useQuery({
    queryKey: feedbackKeys.tags(manuscriptId ?? "none"),
    queryFn: () => getManuscriptAnnotationTags(manuscriptId!),
    enabled: Boolean(manuscriptId),
    staleTime: 30_000,
  });
}

export function useCreateManuscriptAnnotationTag() {
  const invalidate = useInvalidateAnnotationTagData();

  return useMutation({
    mutationFn: createManuscriptAnnotationTag,
    onSuccess: invalidate,
  });
}

export function useUpdateManuscriptAnnotationTagColor() {
  const invalidate = useInvalidateAnnotationTagData();

  return useMutation({
    mutationFn: updateManuscriptAnnotationTagColor,
    onSuccess: invalidate,
  });
}

export function useSetManuscriptAnnotationTagActive() {
  const invalidate = useInvalidateAnnotationTagData();

  return useMutation({
    mutationFn: setManuscriptAnnotationTagActive,
    onSuccess: invalidate,
  });
}
