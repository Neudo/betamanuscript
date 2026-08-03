import { BrandLogo } from "@/components/BrandLogo";
import { Card } from "@/components/ui/card";
import { createNoIndexMetadata } from "@/shared/config/seo";
import { InviteReaderAccess } from "@/features/readers/components/InviteReaderAccess";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { Heading } from "@/shared/ui/Heading";

type InviteReaderPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export const metadata = createNoIndexMetadata("Reader invitation | BetaManuscript");

export default async function InviteReaderPage({ searchParams }: InviteReaderPageProps) {
  const { token } = await searchParams;
  const invitationToken = Array.isArray(token) ? token[0] : token;

  if (!invitationToken || invitationToken.length < 32) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted/30 p-5">
        <Card className="w-full max-w-lg border-foreground/10 p-7">
          <Heading level={1} size="card">Invitation link unavailable</Heading>
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
        <BrandLogo imageClassName="h-9" />
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          BetaManuscript reader invitation
        </p>
        <Heading level={1} size="card" className="mt-2">
          A manuscript is waiting for your feedback.
        </Heading>
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
