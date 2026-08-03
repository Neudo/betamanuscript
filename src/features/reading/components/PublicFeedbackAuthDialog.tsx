import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PublicFeedbackAuthDialog({
  displayName,
  feedbackToken,
  next,
  onOpenChange,
  open,
}: {
  displayName: string;
  feedbackToken: string;
  next: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const authParams = new URLSearchParams({
    displayName,
    feedback: feedbackToken,
    flow: "public-reader",
    next,
  });
  const loginHref = `/login?${authParams.toString()}`;
  const signUpHref = `/signup?${authParams.toString()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save your feedback with a free account</DialogTitle>
          <DialogDescription className="leading-6">
            You can keep reading without an account. Create one or sign in to save feedback,
            join this beta-reading round, and make sure the author can attribute your reaction.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button asChild>
            <Link href={signUpHref}>
              Create free account
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={loginHref}>Log in</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
