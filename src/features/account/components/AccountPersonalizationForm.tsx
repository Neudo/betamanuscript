"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { personalizeAccount } from "../api/personalize-account";
import { getWorkspaceHome, type WorkspaceRole } from "../domain/user-role";
import { accountPersonalizationSchema } from "../schemas/account-personalization.schema";
import { RolePicker } from "./RolePicker";

export function AccountPersonalizationForm({
  accountId,
  initialAvatarPath,
  initialAvatarUrl,
  initialDisplayName,
  initialRole,
  next,
}: {
  accountId: string;
  initialAvatarPath: string | null;
  initialAvatarUrl: string | null;
  initialDisplayName: string;
  initialRole: WorkspaceRole | null;
  next: string | null;
}) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<WorkspaceRole | null>(initialRole);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const [nameError, setNameError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
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
      setRoleError(result.error.flatten().fieldErrors.role?.[0] ?? null);
      return;
    }

    setNameError(null);
    setRoleError(null);
    mutation.mutate({
      accountId,
      avatarFile,
      previousAvatarPath: initialAvatarPath,
      ...result.data,
    });
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (!file) {
      setAvatarPreviewUrl(initialAvatarUrl);
      return;
    }

    setAvatarPreviewUrl(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarFile, avatarPreviewUrl]);

  const initials = initialDisplayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <div className="space-y-3">
        <Label>Profile photo <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-foreground/10">
            {avatarPreviewUrl ? <AvatarImage src={avatarPreviewUrl} alt="Profile photo preview" className="object-cover" /> : null}
            <AvatarFallback className="bg-primary font-mono text-sm font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
              <Camera className="h-3.5 w-3.5" />
              Choose photo
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP up to 2 MB.</p>
          </div>
        </div>
      </div>

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
        <RolePicker value={role} onChange={setRole} compact />
        {roleError ? <p className="text-xs text-destructive">Choose an account role.</p> : null}
      </fieldset>

      {mutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save your account</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto sm:min-w-52" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving your account..." : "Continue to workspace"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
