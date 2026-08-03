export function getSafeInternalPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function getOnboardingPath(next?: string | null) {
  const safeNext = getSafeInternalPath(next);

  return safeNext
    ? `/onboarding?next=${encodeURIComponent(safeNext)}`
    : "/onboarding";
}
