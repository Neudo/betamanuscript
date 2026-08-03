export const publicReaderFlow = "public-reader";

export function getSafeInternalPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export function getPublicReaderPath(value: string | null | undefined) {
  const safePath = getSafeInternalPath(value);

  return safePath
    && /^\/read\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/reading$/i.test(safePath)
    ? safePath
    : null;
}

export function getSafeDisplayName(value: string | null | undefined) {
  if (!value) return null;

  const displayName = value.trim();
  return displayName.length >= 2 && displayName.length <= 80 ? displayName : null;
}

export function getOnboardingPath(next?: string | null) {
  const safeNext = getSafeInternalPath(next);

  return safeNext
    ? `/onboarding?next=${encodeURIComponent(safeNext)}`
    : "/onboarding";
}
