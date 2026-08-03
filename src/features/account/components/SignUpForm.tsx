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
import { signInWithGoogle } from "../api/sign-in-with-google";
import { signUpSchema } from "../schemas/sign-up.schema";
import { GoogleMark } from "./GoogleMark";
import { Turnstile } from "./Turnstile";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function SignUpForm({
  next,
  feedbackToken,
  publicReaderDisplayName,
  publicReaderFlow = false,
}: {
  next: string | null;
  feedbackToken: string | null;
  publicReaderDisplayName: string | null;
  publicReaderFlow?: boolean;
}) {
  const router = useRouter();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess(result) {
      if (result.status === "authenticated") {
        router.replace(result.redirectTo);
        router.refresh();
      }
    },
    onError() {
      setCaptchaToken(null);
      setCaptchaRefreshKey((value) => value + 1);
    },
  });
  const googleMutation = useMutation({
    mutationFn: () => signInWithGoogle({
      displayName: publicReaderDisplayName,
      feedbackToken,
      flow: publicReaderFlow ? "public-reader" : undefined,
      intent: "signup",
      next,
    }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = signUpSchema.safeParse({
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
      displayName: publicReaderDisplayName ?? undefined,
      feedbackToken: feedbackToken ?? undefined,
      flow: publicReaderFlow ? "public-reader" : undefined,
      next,
    });
  }

  if (mutation.data?.status === "confirmation-required") {
    return (
      <Alert className="border-success/30 bg-success/5">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <AlertTitle>Account created</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Check your inbox and confirm your email to return to the manuscript.
            {publicReaderFlow ? " Your feedback is saved and will be added when you confirm your email." : null}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Back to login</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {googleMutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not continue with Google</AlertTitle>
          <AlertDescription>{googleMutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3">
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
        <p className="text-center text-xs text-muted-foreground">
          {publicReaderFlow
            ? `Your feedback will be attributed to ${publicReaderDisplayName}.`
            : "You’ll choose your role and confirm your name next."}
        </p>
      </div>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">or create with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
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

        {turnstileSiteKey ? (
          <Turnstile
            onTokenChange={setCaptchaToken}
            refreshKey={captchaRefreshKey}
            siteKey={turnstileSiteKey}
          />
        ) : null}

        {mutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Could not create your account</AlertTitle>
            <AlertDescription>{mutation.error.message}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending || Boolean(turnstileSiteKey && !captchaToken)}
        >
          {mutation.isPending ? "Creating account..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
