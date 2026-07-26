"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { personalizeAccount } from "../api/personalize-account";
import { getWorkspaceHome, type UserRole } from "../domain/user-role";
import { accountPersonalizationSchema } from "../schemas/account-personalization.schema";
import { RolePicker } from "./RolePicker";

export function AccountPersonalizationForm({
  accountId,
  initialDisplayName,
  initialRole,
  next,
}: {
  accountId: string;
  initialDisplayName: string;
  initialRole: UserRole;
  next: string | null;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [nameError, setNameError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: personalizeAccount,
    onSuccess(result) {
      router.replace(next ?? getWorkspaceHome(result.role));
      router.refresh();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = accountPersonalizationSchema.safeParse({
      displayName: formData.get("displayName"),
      role,
    });

    if (!result.success) {
      setNameError(result.error.flatten().fieldErrors.displayName?.[0] ?? null);
      return;
    }

    setNameError(null);
    mutation.mutate({ accountId, ...result.data });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="displayName">Name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={initialDisplayName}
          autoComplete="name"
          aria-describedby={nameError ? "display-name-error" : undefined}
        />
        {nameError ? (
          <p id="display-name-error" className="text-xs text-destructive">
            {nameError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            This is the name other BetaManuscript members will see.
          </p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">How will you use BetaManuscript?</legend>
        <RolePicker value={role} onChange={setRole} />
      </fieldset>

      {mutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save your account</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving your account..." : "Continue to workspace"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
