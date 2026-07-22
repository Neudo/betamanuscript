import Link from "next/link";

import { AuthScreen } from "./AuthScreen";
import { SignUpForm } from "./SignUpForm";

export function SignUpScreen() {
  return (
    <AuthScreen
      eyebrow="Create account"
      title="Choose your workspace"
      description="You can change this later in account settings."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthScreen>
  );
}
