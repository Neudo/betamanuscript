"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordSchema } from "@/features/account/schemas/update-password.schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { AuthScreen } from "./AuthScreen";

type PasswordErrors = {
  password?: string;
  passwordConfirmation?: string;
};

export function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [isPending, setIsPending] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = updatePasswordSchema.safeParse({ password, passwordConfirmation });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        password: fieldErrors.password?.[0],
        passwordConfirmation: fieldErrors.passwordConfirmation?.[0],
      });
      return;
    }

    setIsPending(true);
    setErrors({});

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: result.data.password });

    if (error) {
      setIsPending(false);
      toast.error(error.message);
      return;
    }

    toast.success("Password updated.");
    router.replace("/dashboard/settings?section=account");
    router.refresh();
  }

  return (
    <AuthScreen
      eyebrow="Account security"
      title="Choose a new password"
      description="Use at least 8 characters, including one uppercase letter and one number."
      footer={<Link href="/login" className="font-medium text-primary-text hover:underline">Return to log in</Link>}
    >
      <form onSubmit={updatePassword} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "new-password-error" : undefined}
          />
          {errors.password ? <p id="new-password-error" className="text-xs text-destructive">{errors.password}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password-confirmation">Confirm new password</Label>
          <Input
            id="new-password-confirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(event) => {
              setPasswordConfirmation(event.target.value);
              setErrors((current) => ({ ...current, passwordConfirmation: undefined }));
            }}
            aria-invalid={Boolean(errors.passwordConfirmation)}
            aria-describedby={errors.passwordConfirmation ? "new-password-confirmation-error" : undefined}
          />
          {errors.passwordConfirmation ? <p id="new-password-confirmation-error" className="text-xs text-destructive">{errors.passwordConfirmation}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </AuthScreen>
  );
}
