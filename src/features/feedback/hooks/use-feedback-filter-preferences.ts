"use client";

import { useCallback, useSyncExternalStore } from "react";

export type FeedbackFilterPreferences = {
  hideReadFeedback: boolean;
  selectedChapterId: string | null;
  selectedReaderId: string | null;
  selectedTagSlug: string | null;
};

const storagePrefix = "betaquill.feedback-filters.v1";
const changeEventName = "betaquillfeedbackfilterchange";

const defaultPreferences: FeedbackFilterPreferences = {
  hideReadFeedback: false,
  selectedChapterId: null,
  selectedReaderId: null,
  selectedTagSlug: null,
};

type CachedPreferences = {
  serializedValue: string | null;
  value: FeedbackFilterPreferences;
};

const preferenceCache = new Map<string, CachedPreferences>();

export function getFeedbackFilterPreferencesStorageKey({
  accountId,
  manuscriptId,
  manuscriptVersionId,
}: {
  accountId: string;
  manuscriptId: string | null;
  manuscriptVersionId: string | null;
}) {
  return [
    storagePrefix,
    accountId,
    manuscriptId ?? "no-manuscript",
    manuscriptVersionId ?? "latest",
  ].join(":");
}

function isOptionalId(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parsePreferences(serializedValue: string | null): FeedbackFilterPreferences {
  if (!serializedValue) return defaultPreferences;

  try {
    const parsed: unknown = JSON.parse(serializedValue);

    if (
      !isRecord(parsed)
      || typeof parsed.hideReadFeedback !== "boolean"
      || !isOptionalId(parsed.selectedChapterId)
      || !isOptionalId(parsed.selectedReaderId)
      || !isOptionalId(parsed.selectedTagSlug)
    ) {
      return defaultPreferences;
    }

    return {
      hideReadFeedback: parsed.hideReadFeedback,
      selectedChapterId: parsed.selectedChapterId,
      selectedReaderId: parsed.selectedReaderId,
      selectedTagSlug: parsed.selectedTagSlug,
    };
  } catch {
    return defaultPreferences;
  }
}

function getStoredPreferences(storageKey: string) {
  if (typeof window === "undefined") return defaultPreferences;

  let serializedValue: string | null;

  try {
    serializedValue = window.localStorage.getItem(storageKey);
  } catch {
    serializedValue = null;
  }

  const cached = preferenceCache.get(storageKey);
  if (cached?.serializedValue === serializedValue) return cached.value;

  const value = parsePreferences(serializedValue);
  preferenceCache.set(storageKey, { serializedValue, value });

  return value;
}

function subscribeToPreferences(storageKey: string, onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) onStoreChange();
  };
  const handleSameTabChange = (event: Event) => {
    if (event instanceof CustomEvent && event.detail === storageKey) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(changeEventName, handleSameTabChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(changeEventName, handleSameTabChange);
  };
}

function savePreferences(storageKey: string, value: FeedbackFilterPreferences) {
  const serializedValue = JSON.stringify(value);
  preferenceCache.set(storageKey, { serializedValue, value });

  try {
    window.localStorage.setItem(storageKey, serializedValue);
  } catch {
    // Keep the current tab working when browser storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent(changeEventName, { detail: storageKey }));
}

export function useFeedbackFilterPreferences(storageKey: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToPreferences(storageKey, onStoreChange),
    [storageKey],
  );
  const getSnapshot = useCallback(() => getStoredPreferences(storageKey), [storageKey]);
  const preferences = useSyncExternalStore(subscribe, getSnapshot, () => defaultPreferences);
  const setPreferences = useCallback(
    (nextPreferences: FeedbackFilterPreferences) => savePreferences(storageKey, nextPreferences),
    [storageKey],
  );

  return [preferences, setPreferences] as const;
}
