"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getManuscript,
  getManuscriptGenres,
  getManuscripts,
} from "@/features/manuscript/api/manuscripts";
import { manuscriptKeys } from "@/features/manuscript/query-keys";

export function useManuscripts() {
  return useQuery({
    queryKey: manuscriptKeys.list(),
    queryFn: getManuscripts,
    staleTime: 60_000,
  });
}

export function useManuscript(manuscriptId: string | null) {
  return useQuery({
    queryKey: manuscriptKeys.detail(manuscriptId ?? "none"),
    queryFn: () => getManuscript(manuscriptId!),
    enabled: Boolean(manuscriptId),
    staleTime: 60_000,
  });
}

export function useManuscriptGenres(enabled = true) {
  return useQuery({
    queryKey: manuscriptKeys.genres(),
    queryFn: getManuscriptGenres,
    enabled,
    staleTime: 5 * 60_000,
  });
}
