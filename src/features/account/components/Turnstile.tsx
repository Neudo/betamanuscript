"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type TurnstileWidgetId = string | number;

type TurnstileApi = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement,
    options: {
      action: string;
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      sitekey: string;
      size: "flexible";
      theme: "auto";
    },
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
  remove: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileProps = {
  onTokenChange: (token: string | null) => void;
  refreshKey: number;
  siteKey: string;
};

export function Turnstile({
  onTokenChange,
  refreshKey,
  siteKey,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const refreshKeyRef = useRef(refreshKey);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const renderWidget = useCallback(() => {
    const container = containerRef.current;
    const turnstile = window.turnstile;

    if (!container || !turnstile || widgetIdRef.current !== null) {
      return;
    }

    turnstile.ready(() => {
      const currentContainer = containerRef.current;
      const currentTurnstile = window.turnstile;

      if (!currentContainer || !currentTurnstile || widgetIdRef.current !== null) {
        return;
      }

      widgetIdRef.current = currentTurnstile.render(currentContainer, {
        action: "turnstile-spin-v2",
        callback: (token) => onTokenChangeRef.current(token),
        "error-callback": () => onTokenChangeRef.current(null),
        "expired-callback": () => onTokenChangeRef.current(null),
        sitekey: siteKey,
        size: "flexible",
        theme: "auto",
      });
    });
  }, [siteKey]);

  useEffect(() => {
    renderWidget();

    return () => {
      const widgetId = widgetIdRef.current;

      if (widgetId !== null) {
        window.turnstile?.remove(widgetId);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  useEffect(() => {
    if (refreshKey === refreshKeyRef.current) {
      return;
    }

    refreshKeyRef.current = refreshKey;
    onTokenChangeRef.current(null);

    if (widgetIdRef.current !== null) {
      window.turnstile?.reset(widgetIdRef.current);
    }
  }, [refreshKey]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div
        ref={containerRef}
        className="cf-turnstile min-h-[65px]"
        data-action="turnstile-spin-v2"
      />
    </>
  );
}
