export async function deleteAccount() {
  const response = await fetch("/api/account", {
    method: "DELETE",
    headers: { "X-Requested-With": "XMLHttpRequest" },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to delete your account. Please try again.");
  }
}
