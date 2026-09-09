import Link from "next/link";

import { AuthScreen } from "./AuthScreen";
import { SignUpForm } from "./SignUpForm";

export function SignUpScreen({
  next,
  uploadedFilename = null,
  uploadError = null,
  feedbackToken,
  publicReaderDisplayName,
  publicReaderFlow = false,
}: {
  next: string | null;
  uploadedFilename?: string | null;
  uploadError?: string | null;
  feedbackToken: string | null;
  publicReaderDisplayName: string | null;
  publicReaderFlow?: boolean;
}) {
  const loginParams = new URLSearchParams();
  if (next) loginParams.set("next", next);
  if (publicReaderFlow) loginParams.set("flow", "public-reader");
  if (publicReaderDisplayName) loginParams.set("displayName", publicReaderDisplayName);
  if (feedbackToken) loginParams.set("feedback", feedbackToken);
  const loginHref = loginParams.size > 0 ? `/login?${loginParams.toString()}` : "/login";

  return (
    <AuthScreen
      eyebrow="Create account"
      title="Create your account"
      description={publicReaderFlow
        ? "Create an account to save the feedback you prepared."
        : "Continue with Google or create an account with your email."}
      footer={
        <p>
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-primary-text hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      {uploadedFilename ? <p className="mb-6 border border-foreground/15 bg-sidebar/40 p-4 text-sm"><strong className="break-words">{uploadedFilename}</strong> is uploaded. Create your account to finish setting up your manuscript.</p> : null}
      {uploadError ? <p role="alert" className="mb-6 text-sm text-destructive">{uploadError}</p> : null}
      <SignUpForm
        next={next}
        feedbackToken={feedbackToken}
        publicReaderDisplayName={publicReaderDisplayName}
        publicReaderFlow={publicReaderFlow}
      />
    </AuthScreen>
  );
}
