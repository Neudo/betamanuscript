import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthScreen } from "@/features/account/components/AuthScreen";
import { LoginForm } from "@/features/account/components/LoginForm";

export function LoginScreen({
  next,
  error,
}: {
  next: string | null;
  error: string | null;
}) {
  const signUpHref = next
    ? `/signup?next=${encodeURIComponent(next)}`
    : "/signup";

  return (
    <AuthScreen
      eyebrow="Welcome back"
      title="Log in to your workspace"
      description="Continue writing, reading, or reviewing feedback."
      footer={
        <p>
          New to BetaManuscript?{" "}
          <Link href={signUpHref} className="font-medium text-primary-text hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      {error === "confirmation" || error === "oauth" ? (
        <Alert variant="destructive">
          <AlertTitle>
            {error === "oauth"
              ? "Google sign-in could not be completed"
              : "Confirmation link could not be verified"}
          </AlertTitle>
          <AlertDescription>
            {error === "oauth"
              ? "Try again, or use your email and password instead."
              : "Request a new confirmation email or try logging in again."}
          </AlertDescription>
        </Alert>
      ) : null}
      <LoginForm next={next} />
    </AuthScreen>
  );
}
