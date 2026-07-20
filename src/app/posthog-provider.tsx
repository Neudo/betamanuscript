"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!key) {
      return;
    }

    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      defaults: "2026-05-30",
    });
  }, []);

  return null;
}
