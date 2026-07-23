"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "../api/sign-up";
import type { UserRole } from "../domain/user-role";
import { signUpSchema } from "../schemas/sign-up.schema";
import { RolePicker } from "./RolePicker";

type FieldErrors = Partial<Record<"displayName" | "email" | "password", string>>;

export function SignUpForm({
  initialRole,
  next,
}: {
  initialRole: UserRole;
  next: string | null;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess(result) {
      if (result.status === "authenticated") {
        router.replace(result.redirectTo);
        router.refresh();
      }
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = signUpSchema.safeParse({
      displayName: formData.get("displayName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role,
    });

    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      setFieldErrors({
        displayName: flattened.displayName?.[0],
        email: flattened.email?.[0],
        password: flattened.password?.[0],
      });
      return;
    }

    setFieldErrors({});
    mutation.mutate({ ...result.data, next });
  }

  if (mutation.data?.status === "confirmation-required") {
    return (
      <Alert className="border-success/30 bg-success/5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle>Account created</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Check your inbox and confirm your email to activate your workspace.</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Back to login</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">Name</Label>
          <Input id="displayName" name="displayName" autoComplete="name" />
          {fieldErrors.displayName ? (
            <p className="text-xs text-destructive">{fieldErrors.displayName}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
        />
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            At least 8 characters, one uppercase letter, and one number.
          </p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">How will you use BetaManuscript?</legend>
        <RolePicker value={role} onChange={setRole} />
      </fieldset>

      {mutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not create your account</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating account..." : "Create account"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
