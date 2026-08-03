"use client";

import { useMutation } from "@tanstack/react-query";

import { createFeatureRequest } from "@/features/feature-requests/api/feature-requests";

export function useCreateFeatureRequest() {
  return useMutation({
    mutationFn: createFeatureRequest,
  });
}
