"use client";

import { useQuery } from "@tanstack/react-query";

import { getManuscriptFeedback } from "@/features/feedback/api/feedback";
import { feedbackKeys } from "@/features/feedback/query-keys";

export function useManuscriptFeedback(manuscriptId: string | null) {
  return useQuery({
    queryKey: feedbackKeys.manuscript(manuscriptId ?? "none"),
    queryFn: () => getManuscriptFeedback(manuscriptId!),
    enabled: Boolean(manuscriptId),
    staleTime: 30_000,
  });
}
