export function getSafeInternalPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}
