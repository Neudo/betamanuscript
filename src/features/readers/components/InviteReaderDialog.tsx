"use client";

import { type FormEvent, useState } from "react";
import { Mail, UserPlus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInviteReader } from "@/features/readers/hooks/use-readers";

type InviteReaderDialogProps = {
  readingRoundId: string;
  triggerVariant?: ButtonProps["variant"];
};

export function InviteReaderDialog({
  readingRoundId,
  triggerVariant = "outline",
}: InviteReaderDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const inviteMutation = useInviteReader();

  function resetForm() {
    setEmail("");
    setPersonalNote("");
    inviteMutation.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    inviteMutation.mutate(
      {
        personalNote,
        readingRoundId,
        recipientEmail: email,
      },
      {
        onSuccess() {
          setOpen(false);
          resetForm();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={triggerVariant}
          className={triggerVariant === "outline" ? "border-primary text-primary" : undefined}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite reader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">Invite a reader</DialogTitle>
          <DialogDescription>
            The invitation is emailed now. It stays pending until the recipient
            signs in and accepts it.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-2 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="reader-email">Email address</Label>
            <Input
              id="reader-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="reader@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reader-note">Personal note <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="reader-note"
              value={personalNote}
              onChange={(event) => setPersonalNote(event.target.value)}
              placeholder="A quick note about the feedback that would help..."
              maxLength={4000}
            />
          </div>
          {inviteMutation.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{inviteMutation.error.message}</AlertDescription>
            </Alert>
          ) : null}
          <Button className="w-full" type="submit" disabled={inviteMutation.isPending || !email.trim()}>
            <Mail className="h-4 w-4" />
            {inviteMutation.isPending ? "Sending invitation..." : "Send invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
