import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedAccount } from "@/features/account/server/get-authenticated-account";
import { pendingUploadPath, uploadIdSchema } from "@/features/manuscript/lib/pending-upload";
import { ResumeManuscriptUpload } from "@/features/manuscript/components/ResumeManuscriptUpload";
import { createNoIndexMetadata } from "@/shared/config/seo";
import { Heading } from "@/shared/ui/Heading";

export const metadata = createNoIndexMetadata("Import your manuscript | BetaManuscript");
export default async function ImportManuscriptPage({ searchParams }: { searchParams: Promise<{ upload?: string }> }) {
  const parsed = uploadIdSchema.safeParse((await searchParams).upload);
  if (!parsed.success) redirect("/dashboard");
  const next = pendingUploadPath(parsed.data);
  const account = await getAuthenticatedAccount();
  if (!account) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (account.role === null) redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  if (account.role === "reader") return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-16">
      <Heading level={1} size="workspace">Your manuscript is saved</Heading>
      <p>Switch your account role to Writer or Writer &amp; reader to finish importing it.</p>
      <Link href="/reader/settings" className="text-primary-text underline">Update your account role</Link>
      <p className="text-sm text-muted-foreground">Then return to this page to continue your import.</p>
    </main>
  );
  return <ResumeManuscriptUpload id={parsed.data} />;
}
