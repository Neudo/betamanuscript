import Link from "next/link";

import { AuthScreen } from "./AuthScreen";
import { SignUpForm } from "./SignUpForm";

export function SignUpScreen({
  next,
}: {
  next: string | null;
}) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthScreen
      eyebrow="Create account"
      title="Create your account"
      description="Continue with Google or create an account with your email."
      footer={
        <p>
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <SignUpForm next={next} />
    </AuthScreen>
  );
}
