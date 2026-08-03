import Link from "next/link";

import { AuthScreen } from "./AuthScreen";
import { SignUpForm } from "./SignUpForm";

export function SignUpScreen({
  next,
  publicReaderDisplayName,
  publicReaderFlow = false,
}: {
  next: string | null;
  publicReaderDisplayName: string | null;
  publicReaderFlow?: boolean;
}) {
  const loginParams = new URLSearchParams();
  if (next) loginParams.set("next", next);
  if (publicReaderFlow) loginParams.set("flow", "public-reader");
  if (publicReaderDisplayName) loginParams.set("displayName", publicReaderDisplayName);
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
      <SignUpForm
        next={next}
        publicReaderDisplayName={publicReaderDisplayName}
        publicReaderFlow={publicReaderFlow}
      />
    </AuthScreen>
  );
}
