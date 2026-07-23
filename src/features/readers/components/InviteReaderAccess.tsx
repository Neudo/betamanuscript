"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type InviteReaderAccessProps = {
  isAuthenticated: boolean;
  token: string;
};

export function InviteReaderAccess({
  isAuthenticated,
  token,
}: InviteReaderAccessProps) {
  const router = useRouter();
  const next = `/invite/reader?token=${encodeURIComponent(token)}`;
  const mutation = useMutation({
    async mutationFn() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("accept_reading_invitation", {
        p_token: token,
      });

      if (error) {
        throw new Error(error.message);
      }

      const accepted = data?.[0];
      if (!accepted) {
        throw new Error("The invitation could not be accepted.");
      }

      return accepted;
    },
    onSuccess() {
      router.replace("/reader");
      router.refresh();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          To protect the author’s manuscript, sign in or create an account with
          the email address that received this invitation.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href={`/signup?role=reader&next=${encodeURIComponent(next)}`}>
              Create reader account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        You are signed in. Accepting will add this manuscript to your reading
        list.
      </p>
      {mutation.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Invitation unavailable</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "Accepting invitation..." : "Accept invitation"}
        <CheckCircle2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
