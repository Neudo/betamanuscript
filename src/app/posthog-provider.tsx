"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

const ANALYTICS_OPT_OUT_COOKIE = "betamanuscript_analytics_opt_out=1";

function isAnalyticsOptedOut() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === ANALYTICS_OPT_OUT_COOKIE);
}

export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!key || isAnalyticsOptedOut()) {
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
