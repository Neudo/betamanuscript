"use client";

import { type FormEvent, useState } from "react";
import { Settings2, UsersRound } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountPlan } from "@/features/account/types";
import { useUpdateReaderLimit } from "@/features/readers/hooks/use-readers";

type ReaderLimitDialogProps = {
  accountPlan: AccountPlan;
  currentLimit: number;
  minimumLimit: number;
  readingRoundId: string;
};

export function ReaderLimitDialog({
  accountPlan,
  currentLimit,
  minimumLimit,
  readingRoundId,
}: ReaderLimitDialogProps) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(String(currentLimit));
  const updateLimitMutation = useUpdateReaderLimit();
  const hasProPlan = accountPlan === "pro";
  const parsedLimit = Number(limit);
  const limitIsWholeNumber = Number.isInteger(parsedLimit);
  const exceedsFreeLimit = !hasProPlan && parsedLimit > 5;
  const isBelowStartedReaders = parsedLimit < minimumLimit;
  const isValid = limitIsWholeNumber && parsedLimit >= 1 && !exceedsFreeLimit && !isBelowStartedReaders;

  function reset() {
    setLimit(String(currentLimit));
    updateLimitMutation.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    updateLimitMutation.mutate(
      { maxReaders: parsedLimit, readingRoundId },
      {
        onSuccess() {
          setOpen(false);
          reset();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground">
          <Settings2 className="h-3.5 w-3.5" />
          Edit limit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-medium">
            <UsersRound className="h-4 w-4 text-primary" />
            Reader limit
          </DialogTitle>
          <DialogDescription>
            Set how many readers can start this reading round. Pending invitations do not use a slot until they are accepted.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="reader-limit">Maximum readers</Label>
            <div className="flex items-center gap-2">
              <Input
                id="reader-limit"
                type="number"
                inputMode="numeric"
                min={minimumLimit}
                max={hasProPlan ? undefined : 5}
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                className="h-11 w-24 rounded-none border-foreground/20 px-3 text-center font-mono text-base font-normal shadow-none"
              />
              <span className="text-sm text-muted-foreground">readers</span>
            </div>
            <p className="font-mono text-[10px] leading-5 text-muted-foreground">
              {hasProPlan
                ? "Pro supports any reader limit."
                : "Free supports up to 5 readers per reading round."}
            </p>
          </div>

          {minimumLimit > 1 ? (
            <p className="border-l-2 border-primary/55 pl-3 text-xs leading-5 text-muted-foreground">
              {minimumLimit} readers have already started this round, so the limit cannot be set lower.
            </p>
          ) : null}

          {isBelowStartedReaders ? (
            <Alert variant="destructive">
              <AlertDescription>
                Set the limit to at least {minimumLimit} reader{minimumLimit === 1 ? "" : "s"}.
              </AlertDescription>
            </Alert>
          ) : exceedsFreeLimit ? (
            <Alert variant="destructive">
              <AlertDescription>Free workspaces can invite up to 5 readers per round.</AlertDescription>
            </Alert>
          ) : updateLimitMutation.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{updateLimitMutation.error.message}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={!isValid || updateLimitMutation.isPending}>
              {updateLimitMutation.isPending ? "Saving…" : "Save reader limit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
