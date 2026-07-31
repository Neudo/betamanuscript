import type { SignUpInput } from "../schemas/sign-up.schema";

export async function signUp(
  input: SignUpInput & { captchaToken?: string; next?: string | null },
) {
  const response = await fetch("/api/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as {
    error?: string;
    ok?: boolean;
    redirectTo?: string;
    status?: "authenticated" | "confirmation-required";
  };

  if (!response.ok || !result.ok || !result.redirectTo || !result.status) {
    throw new Error(result.error ?? "Could not create your account. Please try again.");
  }

  return {
    redirectTo: result.redirectTo,
    status: result.status,
  };
}
