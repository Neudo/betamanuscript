import type { SignInInput } from "@/features/account/schemas/sign-in.schema";

export async function signIn(
  input: SignInInput & {
    captchaToken?: string;
    flow?: "public-reader";
    next?: string | null;
  },
) {
  const response = await fetch("/api/auth/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as {
    error?: string;
    ok?: boolean;
    redirectTo?: string;
  };

  if (!response.ok || !result.ok || !result.redirectTo) {
    throw new Error(result.error ?? "Could not log you in. Please try again.");
  }

  return { redirectTo: result.redirectTo };
}
