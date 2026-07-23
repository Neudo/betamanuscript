"use client";

import { Clock3, Mail, RotateCcw, UserRoundX } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { InviteReaderDialog } from "@/features/readers/components/InviteReaderDialog";
import type { ReaderStatus } from "@/features/readers/api/readers";
import {
  useReaderRounds,
  useResendReaderInvitation,
  useRevokeReaderInvitation,
} from "@/features/readers/hooks/use-readers";

const statusStyles: Record<ReaderStatus, string> = {
  active: "border-sky-800/25 bg-sky-800/10 text-sky-900",
  completed: "border-success/25 bg-success/10 text-success",
  pending: "border-warning/25 bg-warning/10 text-warning",
  revoked: "border-border bg-muted text-muted-foreground",
  started: "border-sky-800/25 bg-sky-800/10 text-sky-900",
};

const statusLabels: Record<ReaderStatus, string> = {
  active: "Started",
  completed: "Completed",
  pending: "Pending",
  revoked: "Revoked",
  started: "Started",
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ReadersManager() {
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const readerRoundsQuery = useReaderRounds();
  const resendMutation = useResendReaderInvitation();
  const revokeMutation = useRevokeReaderInvitation();
  const readerRounds = readerRoundsQuery.data ?? [];
  const activeRound = readerRounds.find((round) => round.id === selectedRoundId)
    ?? readerRounds[0]
    ?? null;

  const startedCount = activeRound
    ? activeRound.readers.filter((reader) => reader.status === "started" || reader.status === "completed").length
    : 0;
  const pendingCount = activeRound
    ? activeRound.readers.filter((reader) => reader.status === "pending").length
    : 0;
  const completedCount = activeRound
    ? activeRound.readers.filter((reader) => reader.status === "completed").length
    : 0;

  return (
    <div className="min-h-full">
      <PageHeader
        eyebrow="Readers"
        title="Beta readers"
        description={activeRound ? `${activeRound.manuscriptTitle} · ${activeRound.versionTitle}` : undefined}
        actions={activeRound ? <InviteReaderDialog readingRoundId={activeRound.id} triggerVariant="default" /> : undefined}
      />

      <div className="max-w-[1100px] space-y-6 p-5 sm:p-8">
        {readerRoundsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reader invitations…</p>
        ) : null}

        {readerRoundsQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{readerRoundsQuery.error.message}</AlertDescription>
          </Alert>
        ) : null}

        {!readerRoundsQuery.isLoading && !readerRoundsQuery.isError && !activeRound ? (
          <Card className="border-dashed p-8 text-center">
            <Mail className="mx-auto h-5 w-5 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">No manuscript to share yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a manuscript first, then send an email invitation from this page.
            </p>
          </Card>
        ) : null}

        {activeRound ? (
          <>
            {readerRounds.length > 1 ? (
              <div className="max-w-sm space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground" htmlFor="reading-round">
                  Reading round
                </label>
                <Select value={activeRound.id} onValueChange={setSelectedRoundId}>
                  <SelectTrigger id="reading-round"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {readerRounds.map((round) => (
                      <SelectItem key={round.id} value={round.id}>
                        {round.manuscriptTitle} · {round.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-3">
              {[
                ["Readers started", `${startedCount} / ${activeRound.maxReaders}`],
                ["Pending invitations", String(pendingCount)],
                ["Completed", String(completedCount)],
              ].map(([label, value]) => (
                <div key={label} className="border border-foreground/10 bg-card p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
                  <p className="mt-3 text-3xl font-normal">{value}</p>
                </div>
              ))}
            </section>

            {startedCount >= activeRound.maxReaders && pendingCount > 0 ? (
              <Alert className="border-warning/25 bg-warning/5">
                <Clock3 className="h-4 w-4 text-warning" />
                <AlertDescription>
                  The round is currently full. Pending invitations stay pending,
                  but the next acceptance will be refused until a reader is removed.
                </AlertDescription>
              </Alert>
            ) : null}

            <Card className="overflow-hidden border-foreground/10">
              <Table>
                <TableHeader className="bg-sidebar/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-mono text-[9px] uppercase tracking-widest">Reader</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-widest">Started</TableHead>
                    <TableHead className="font-mono text-[9px] uppercase tracking-widest">Invitation</TableHead>
                    <TableHead className="w-44"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRound.readers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                        No invitations have been sent for this round.
                      </TableCell>
                    </TableRow>
                  ) : activeRound.readers.map((reader) => (
                    <TableRow key={reader.id}>
                      <TableCell>
                        <div>
                          <span className="block text-xs font-medium">{reader.name ?? reader.email}</span>
                          <span className="block text-[10px] text-muted-foreground">{reader.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-none font-mono text-[8px] uppercase ${statusStyles[reader.status]}`}>
                          {statusLabels[reader.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(reader.startedAt)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {reader.status === "pending" ? (reader.sentAt ? `Sent · expires ${formatDate(reader.expiresAt)}` : "Email not sent") : "Accepted"}
                      </TableCell>
                      <TableCell>
                        {reader.invitationId && reader.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => resendMutation.mutate(reader.invitationId!)}
                              disabled={resendMutation.isPending}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeMutation.mutate(reader.invitationId!)}
                              disabled={revokeMutation.isPending}
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
                            onClick={() => revokeMutation.mutate(reader.invitationId!)}
                            disabled={revokeMutation.isPending}
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

            {resendMutation.isError || revokeMutation.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {resendMutation.error?.message ?? revokeMutation.error?.message}
                </AlertDescription>
              </Alert>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
