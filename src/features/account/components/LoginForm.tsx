"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/features/account/api/sign-in";
import { signInWithGoogle } from "@/features/account/api/sign-in-with-google";
import { signInSchema } from "@/features/account/schemas/sign-in.schema";
import { GoogleMark } from "./GoogleMark";
import { Turnstile } from "./Turnstile";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm({
  next,
  feedbackToken,
  publicReaderFlow = false,
}: {
  next: string | null;
  feedbackToken: string | null;
  publicReaderFlow?: boolean;
}) {
  const router = useRouter();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess(result) {
      router.replace(result.redirectTo);
      router.refresh();
    },
    onError() {
      setCaptchaToken(null);
      setCaptchaRefreshKey((value) => value + 1);
    },
  });
  const googleMutation = useMutation({
    mutationFn: () => signInWithGoogle({
      feedbackToken,
      flow: publicReaderFlow ? "public-reader" : undefined,
      intent: "login",
      next,
    }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      setFieldErrors({
        email: flattened.email?.[0],
        password: flattened.password?.[0],
      });
      return;
    }

    setFieldErrors({});

    if (turnstileSiteKey && !captchaToken) {
      return;
    }

    mutation.mutate({
      ...result.data,
      captchaToken: captchaToken ?? undefined,
      feedbackToken: feedbackToken ?? undefined,
      flow: publicReaderFlow ? "public-reader" : undefined,
      next,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
        />
        {fieldErrors.email ? (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : null}
      </div>

      {turnstileSiteKey ? (
        <Turnstile
          onTokenChange={setCaptchaToken}
          refreshKey={captchaRefreshKey}
          siteKey={turnstileSiteKey}
        />
      ) : null}

      {mutation.isError || googleMutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not log you in</AlertTitle>
          <AlertDescription>
            {mutation.error?.message ?? googleMutation.error?.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={mutation.isPending || Boolean(turnstileSiteKey && !captchaToken)}
      >
        {mutation.isPending ? "Logging in..." : "Log in"}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={googleMutation.isPending}
        onClick={() => googleMutation.mutate()}
      >
        <GoogleMark />
        {googleMutation.isPending ? "Connecting to Google..." : "Continue with Google"}
      </Button>
    </form>
  );
}
