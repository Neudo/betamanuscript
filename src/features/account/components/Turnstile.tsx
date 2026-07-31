"use client";

import { useCallback, useEffect, useRef } from "react";
import { loadTurnstileScript } from "./TurnstileScript";

type TurnstileWidgetId = string | number;

type TurnstileApi = {
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

    try {
      widgetIdRef.current = turnstile.render(container, {
        action: "turnstile-spin-v2",
        callback: (token) => onTokenChangeRef.current(token),
        "error-callback": () => onTokenChangeRef.current(null),
        "expired-callback": () => onTokenChangeRef.current(null),
        sitekey: siteKey,
        size: "flexible",
        theme: "auto",
      });
    } catch {
      onTokenChangeRef.current(null);
    }
  }, [siteKey]);

  useEffect(() => {
    let isMounted = true;

    void loadTurnstileScript()
      .then(() => {
        if (isMounted) {
          renderWidget();
        }
      })
      .catch(() => {
        if (isMounted) {
          onTokenChangeRef.current(null);
        }
      });

    return () => {
      isMounted = false;

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
    <div
      ref={containerRef}
      className="cf-turnstile min-h-[65px]"
      data-action="turnstile-spin-v2"
    />
  );
}
