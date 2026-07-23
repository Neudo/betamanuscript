import Link from "next/link";

import type { UserRole } from "../domain/user-role";
import { AuthScreen } from "./AuthScreen";
import { SignUpForm } from "./SignUpForm";

export function SignUpScreen({
  initialRole,
  next,
}: {
  initialRole: UserRole;
  next: string | null;
}) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthScreen
      eyebrow="Create account"
      title="Choose your workspace"
      description="You can change this later in account settings."
      footer={
        <p>
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <SignUpForm initialRole={initialRole} next={next} />
    </AuthScreen>
  );
}
