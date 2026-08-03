import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthScreen } from "@/features/account/components/AuthScreen";
import { LoginForm } from "@/features/account/components/LoginForm";

export function LoginScreen({
  next,
  feedbackToken,
  error,
  confirmed,
  publicReaderDisplayName,
  publicReaderFlow = false,
}: {
  next: string | null;
  feedbackToken: string | null;
  error: string | null;
  confirmed: boolean;
  publicReaderDisplayName: string | null;
  publicReaderFlow?: boolean;
}) {
  const signUpParams = new URLSearchParams();
  if (next) signUpParams.set("next", next);
  if (publicReaderFlow) signUpParams.set("flow", "public-reader");
  if (publicReaderDisplayName) signUpParams.set("displayName", publicReaderDisplayName);
  if (feedbackToken) signUpParams.set("feedback", feedbackToken);
  const signUpHref = signUpParams.size > 0 ? `/signup?${signUpParams.toString()}` : "/signup";

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
      {error === "confirmation" || error === "oauth" || error === "password-recovery" ? (
        <Alert variant="destructive">
          <AlertTitle>
            {error === "oauth"
              ? "Google sign-in could not be completed"
              : error === "password-recovery"
                ? "Password recovery link could not be verified"
              : "Confirmation link could not be verified"}
          </AlertTitle>
          <AlertDescription>
            {error === "oauth"
              ? "Try again, or use your email and password instead."
              : error === "password-recovery"
                ? "Request a new password reset email from your account settings."
              : "Request a new confirmation email or try logging in again."}
          </AlertDescription>
        </Alert>
      ) : null}
      {confirmed ? (
        <Alert className="border-success/30 bg-success/5">
          <AlertTitle>Email confirmed</AlertTitle>
          <AlertDescription>
            Log in to finish setting up your account.
          </AlertDescription>
        </Alert>
      ) : null}
      <LoginForm
        next={next}
        feedbackToken={feedbackToken}
        publicReaderFlow={publicReaderFlow}
      />
    </AuthScreen>
  );
}
