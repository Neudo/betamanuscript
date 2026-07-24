"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getReaderRounds,
  inviteReader,
  resendReaderInvitation,
  revokeReaderInvitation,
} from "@/features/readers/api/readers";
import { readerKeys } from "@/features/readers/query-keys";
import { dashboardKeys } from "@/features/dashboard/query-keys";
import { manuscriptKeys } from "@/features/manuscript/query-keys";

function useInvalidateReaderData() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      queryClient.invalidateQueries({ queryKey: readerKeys.all }),
      queryClient.invalidateQueries({ queryKey: manuscriptKeys.all }),
    ]);
  };
}

export function useReaderRounds() {
  return useQuery({
    queryKey: readerKeys.rounds(),
    queryFn: getReaderRounds,
    staleTime: 30_000,
  });
}

export function useInviteReader() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: inviteReader,
    onSettled: invalidate,
  });
}

export function useResendReaderInvitation() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: resendReaderInvitation,
    onSettled: invalidate,
  });
}

export function useRevokeReaderInvitation() {
  const invalidate = useInvalidateReaderData();

  return useMutation({
    mutationFn: revokeReaderInvitation,
    onSettled: invalidate,
  });
}
