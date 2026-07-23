import { BookOpen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { InviteReaderAccess } from "@/features/readers/components/InviteReaderAccess";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";

type InviteReaderPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function InviteReaderPage({ searchParams }: InviteReaderPageProps) {
  const { token } = await searchParams;
  const invitationToken = Array.isArray(token) ? token[0] : token;

  if (!invitationToken || invitationToken.length < 32) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted/30 p-5">
        <Card className="w-full max-w-lg border-foreground/10 p-7">
          <h1 className="text-2xl font-medium">Invitation link unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Ask the author to send you a fresh invitation link.
          </p>
        </Card>
      </main>
    );
  }

  const account = await getAuthenticatedAccount();

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-5">
      <Card className="w-full max-w-lg border-foreground/10 p-7 sm:p-9">
        <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          BetaManuscript reader invitation
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">
          A manuscript is waiting for your feedback.
        </h1>
        <div className="mt-7">
          <InviteReaderAccess
            isAuthenticated={Boolean(account)}
            token={invitationToken}
          />
        </div>
      </Card>
    </main>
  );
}
