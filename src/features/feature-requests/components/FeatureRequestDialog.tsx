"use client";

import { type FormEvent, useState } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFeatureRequest } from "@/features/feature-requests/hooks/use-feature-requests";
import { Heading } from "@/shared/ui/Heading";

export function FeatureRequestDialog({ manuscriptId }: { manuscriptId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const featureRequestMutation = useCreateFeatureRequest();

  function resetForm() {
    setMessage("");
    featureRequestMutation.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    featureRequestMutation.mutate(
      { manuscriptId, message },
      {
        onSuccess() {
          toast.success("Feature request sent. Thank you.");
          setOpen(false);
          resetForm();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-foreground/15">
          <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.6} />
          Feature request
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-foreground/15 bg-card p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-foreground/10 px-6 pb-5 pt-6">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Product feedback
          </p>
          <DialogTitle asChild>
            <Heading level={2} size="subsection">What should we build next?</Heading>
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-md leading-6">
            Your requests help shape BetaManuscript. Tell us what would make collecting and using reader feedback more useful for you.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5 px-6 py-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <Label htmlFor="feature-request-message">Your request</Label>
              <span className="font-mono text-[9px] text-muted-foreground">{message.length} / 2,000</span>
            </div>
            <Textarea
              id="feature-request-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="For example, I would like to compare reader feedback between two drafts…"
              className="min-h-36 rounded-none border-foreground/15 bg-background text-sm"
              minLength={10}
              maxLength={2000}
              required
              autoFocus
            />
          </div>

          {featureRequestMutation.isError ? (
            <p className="text-xs text-destructive" role="alert">
              {featureRequestMutation.error.message}
            </p>
          ) : null}

          <div className="flex justify-end border-t border-foreground/10 pt-4">
            <Button type="submit" disabled={featureRequestMutation.isPending}>
              {featureRequestMutation.isPending ? "Sending…" : "Send request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
