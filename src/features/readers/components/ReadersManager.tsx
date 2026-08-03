"use client";

import { useSearchParams } from "next/navigation";
import { Check, Copy, Link2, Mail, RotateCcw, UserRoundX, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import type { AccountPlan } from "@/features/account/types";
import { InviteReaderDialog } from "@/features/readers/components/InviteReaderDialog";
import { DraftAccessDialog } from "@/features/readers/components/DraftAccessDialog";
import { ReaderLimitDialog } from "@/features/readers/components/ReaderLimitDialog";
import type { ManuscriptReaders } from "@/features/readers/api/readers";
import {
  useManuscriptReaders,
  useDisablePublicReadingLink,
  useEnablePublicReadingLink,
  useReviewReaderPlaceRequest,
  useResendReaderInvitation,
  useRevokeReaderInvitation,
  useSetReaderChapterAccess,
  useSetReaderDraftAccess,
} from "@/features/readers/hooks/use-readers";
import { Heading } from "@/shared/ui/Heading";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ReadersManager({ accountPlan }: { accountPlan: AccountPlan }) {
  const searchParams = useSearchParams();
  const manuscriptsQuery = useManuscriptReaders();
  const resendMutation = useResendReaderInvitation();
  const revokeMutation = useRevokeReaderInvitation();
  const chapterAccessMutation = useSetReaderChapterAccess();
  const draftAccessMutation = useSetReaderDraftAccess();
  const enablePublicLinkMutation = useEnablePublicReadingLink();
  const disablePublicLinkMutation = useDisablePublicReadingLink();
  const reviewPlaceRequestMutation = useReviewReaderPlaceRequest();
  const manuscripts = manuscriptsQuery.data ?? [];
  const selectedManuscript = manuscripts.find(
    (manuscript) => manuscript.id === searchParams.get("manuscriptId"),
  );
  const visibleManuscripts = selectedManuscript ? [selectedManuscript] : manuscripts;

  return (
    <div className="min-h-full">
      <PageHeader eyebrow="Readers" title="Beta readers" />

      <div className="max-w-[1100px] space-y-6 p-5 sm:p-8">
        {manuscriptsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading readers…</p>
        ) : null}

        {manuscriptsQuery.error ? (
          <Alert variant="destructive">
            <AlertDescription>{manuscriptsQuery.error.message}</AlertDescription>
          </Alert>
        ) : null}

        {!manuscriptsQuery.isLoading && !manuscriptsQuery.error && manuscripts.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <Mail className="mx-auto h-5 w-5 text-muted-foreground" />
            <Heading level={2} size="subsection" className="mt-4">No manuscript yet</Heading>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a manuscript before inviting beta readers.
            </p>
          </Card>
        ) : null}

        {visibleManuscripts.map((manuscript) => (
          <ManuscriptReadersSection
            key={manuscript.id}
            isResending={resendMutation.isPending}
            isRevoking={revokeMutation.isPending}
            isUpdatingChapterAccess={chapterAccessMutation.isPending}
            isUpdatingDraftAccess={draftAccessMutation.isPending}
            isUpdatingPublicLink={enablePublicLinkMutation.isPending || disablePublicLinkMutation.isPending}
            isReviewingPlaceRequests={reviewPlaceRequestMutation.isPending}
            accountPlan={accountPlan}
            manuscript={manuscript}
            onResend={(invitationId) => resendMutation.mutate(invitationId)}
            onRevoke={(invitationId) => revokeMutation.mutate(invitationId)}
            onChapterAccessChange={(input, options) => chapterAccessMutation.mutate(input, options)}
            onDraftAccessChange={(input) => draftAccessMutation.mutate(input)}
            onEnablePublicLink={(readingRoundId) => enablePublicLinkMutation.mutate(readingRoundId)}
            onDisablePublicLink={(readingRoundId) => disablePublicLinkMutation.mutate(readingRoundId)}
            onReviewPlaceRequest={(input) => reviewPlaceRequestMutation.mutate(input)}
          />
        ))}

        {resendMutation.isError || revokeMutation.isError || chapterAccessMutation.isError || draftAccessMutation.isError || enablePublicLinkMutation.isError || disablePublicLinkMutation.isError || reviewPlaceRequestMutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {resendMutation.error?.message
                ?? revokeMutation.error?.message
                ?? chapterAccessMutation.error?.message
                ?? draftAccessMutation.error?.message
                ?? enablePublicLinkMutation.error?.message
                ?? disablePublicLinkMutation.error?.message
                ?? reviewPlaceRequestMutation.error?.message}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}

function ManuscriptReadersSection({
  accountPlan,
  isResending,
  isRevoking,
  isUpdatingChapterAccess,
  isUpdatingDraftAccess,
  isUpdatingPublicLink,
  isReviewingPlaceRequests,
  manuscript,
  onResend,
  onRevoke,
  onChapterAccessChange,
  onDraftAccessChange,
  onEnablePublicLink,
  onDisablePublicLink,
  onReviewPlaceRequest,
}: {
  accountPlan: AccountPlan;
  isResending: boolean;
  isRevoking: boolean;
  isUpdatingChapterAccess: boolean;
  isUpdatingDraftAccess: boolean;
  isUpdatingPublicLink: boolean;
  isReviewingPlaceRequests: boolean;
  manuscript: ManuscriptReaders;
  onResend: (invitationId: string) => void;
  onRevoke: (invitationId: string) => void;
  onChapterAccessChange: (
    input: { chapterIds: string[]; readerAssignmentId: string },
    options: { onSuccess: () => void },
  ) => void;
  onDraftAccessChange: (input: {
    enabled: boolean;
    manuscriptVersionId: string;
    readerProfileId: string;
  }) => void;
  onEnablePublicLink: (readingRoundId: string) => void;
  onDisablePublicLink: (readingRoundId: string) => void;
  onReviewPlaceRequest: (input: { accept: boolean; requestId: string }) => void;
}) {
  const startedCount = manuscript.readers.filter((reader) => (
    reader.status === "started" || reader.status === "active" || reader.status === "completed"
  )).length;
  const pendingCount = manuscript.readers.filter((reader) => reader.status === "pending").length;
  const completedCount = manuscript.readers.filter((reader) => reader.status === "completed").length;
  const isAtReaderLimit = accountPlan === "free"
    && manuscript.maxReaders !== null
    && startedCount >= manuscript.maxReaders;

  async function copyPublicLink() {
    if (!manuscript.publicLinkId) return;

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/read/${manuscript.publicLinkId}`);
    } catch {
      // Clipboard permission is a browser concern; selecting the displayed URL remains possible.
    }
  }

  return (
    <section className="space-y-4 border-t border-foreground/10 pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Heading level={2} size="subsection">{manuscript.title}</Heading>
        <InviteReaderDialog manuscriptId={manuscript.id} triggerVariant="default" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-foreground/10 bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Readers started</p>
            {accountPlan === "free" && manuscript.readingRoundId && manuscript.maxReaders !== null ? (
              <ReaderLimitDialog
                accountPlan={accountPlan}
                currentLimit={manuscript.maxReaders}
                minimumLimit={Math.max(1, startedCount)}
                readingRoundId={manuscript.readingRoundId}
              />
            ) : null}
          </div>
          <p className="mt-3 text-3xl font-normal">{accountPlan === "pro" ? `${startedCount} / ∞` : `${startedCount} / ${manuscript.maxReaders ?? "—"}`}</p>
        </div>
        <div className="border border-foreground/10 bg-card p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Pending invitations</p>
          <p className="mt-3 text-3xl font-normal">{pendingCount}</p>
        </div>
        <div className="border border-foreground/10 bg-card p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Completed</p>
          <p className="mt-3 text-3xl font-normal">{completedCount}</p>
        </div>
      </div>

      {isAtReaderLimit && pendingCount > 0 ? (
        <Alert>
          <AlertDescription>
            The reader limit has been reached. Pending invitations can be accepted after you increase it.
          </AlertDescription>
        </Alert>
      ) : null}

      {manuscript.readingRoundId ? (
        <Card className="border-foreground/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-text">
                <Link2 className="h-4 w-4" />
                <p className="font-mono text-[9px] uppercase tracking-[0.16em]">Public reading link</p>
              </div>
              <p className="mt-2 text-sm text-foreground">
                {manuscript.publicLinkId ? "Enabled for this reading round." : "Disabled — invited readers can still use their private invitations."}
              </p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                Anyone with this link can read this draft. Saving feedback still requires a BetaManuscript account and takes a reader place only when feedback is first saved.
              </p>
            </div>
            {manuscript.publicLinkId ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void copyPublicLink()}>
                  <Copy className="h-3.5 w-3.5" />Copy link
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDisablePublicLink(manuscript.readingRoundId!)} disabled={isUpdatingPublicLink}>
                  <X className="h-3.5 w-3.5" />Disable
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => onEnablePublicLink(manuscript.readingRoundId!)} disabled={isUpdatingPublicLink}>
                <Link2 className="h-3.5 w-3.5" />Enable public link
              </Button>
            )}
          </div>
          {manuscript.publicLinkId ? (
            <div className="mt-4 flex items-center gap-2 border border-foreground/10 bg-muted/20 px-3 py-2 font-mono text-[11px] text-muted-foreground">
              <span className="truncate">/read/{manuscript.publicLinkId}</span>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card className="overflow-hidden border-foreground/10">
        <Table>
          <TableHeader className="bg-sidebar/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-mono text-[9px] uppercase tracking-widest">Reader</TableHead>
              <TableHead className="font-mono text-[9px] uppercase tracking-widest">Feedback</TableHead>
              <TableHead className="font-mono text-[9px] uppercase tracking-widest">Started</TableHead>
              <TableHead className="font-mono text-[9px] uppercase tracking-widest">Origin</TableHead>
              <TableHead className="font-mono text-[9px] uppercase tracking-widest">Invitation</TableHead>
              <TableHead className="font-mono text-[9px] uppercase tracking-widest">Draft access</TableHead>
              <TableHead className="w-44"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manuscript.readers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                  No readers have joined this manuscript yet.
                </TableCell>
              </TableRow>
            ) : manuscript.readers.map((reader) => (
              <TableRow key={reader.id}>
                <TableCell>
                  <div>
                    <span className="block text-xs font-medium">{reader.name ?? reader.email}</span>
                    <span className="block text-[10px] text-muted-foreground">{reader.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{reader.feedbackCount}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(reader.joinedAt ?? reader.startedAt)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {reader.participationOrigin === "public_link" ? "Public link" : "Invitation"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {reader.status === "pending"
                    ? reader.sentAt ? `Sent · expires ${formatDate(reader.expiresAt)}` : "Email not sent"
                    : reader.status === "revoked" ? "Revoked" : "Accepted"}
                </TableCell>
                <TableCell>
                  <DraftAccessDialog
                    drafts={manuscript.drafts}
                    isUpdatingChapterAccess={isUpdatingChapterAccess}
                    isUpdatingDraftAccess={isUpdatingDraftAccess}
                    onAccessChange={onDraftAccessChange}
                    onChapterAccessChange={onChapterAccessChange}
                    reader={reader}
                  />
                </TableCell>
                <TableCell>
                  {reader.invitationId && reader.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onResend(reader.invitationId!)}
                        disabled={isResending}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRevoke(reader.invitationId!)}
                        disabled={isRevoking}
                      >
                        <UserRoundX className="h-3.5 w-3.5" />
                        Revoke
                      </Button>
                    </div>
                  ) : reader.invitationId && (reader.status === "started" || reader.status === "completed") ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto flex"
                      onClick={() => onRevoke(reader.invitationId!)}
                      disabled={isRevoking}
                    >
                      <UserRoundX className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {manuscript.placeRequests.length > 0 ? (
        <Card className="overflow-hidden border-foreground/10">
          <div className="border-b border-foreground/10 bg-sidebar/70 px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Reader place requests</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Reader</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Requested</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="w-48"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manuscript.placeRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <span className="block text-xs font-medium">{request.readerName}</span>
                    <span className="block text-[10px] text-muted-foreground">{request.readerEmail}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(request.requestedAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{request.status}</TableCell>
                  <TableCell>
                    {request.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => onReviewPlaceRequest({ accept: false, requestId: request.id })} disabled={isReviewingPlaceRequests}>
                          <X className="h-3.5 w-3.5" />Decline
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onReviewPlaceRequest({ accept: true, requestId: request.id })} disabled={isReviewingPlaceRequests}>
                          <Check className="h-3.5 w-3.5" />Accept
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}
    </section>
  );
}
