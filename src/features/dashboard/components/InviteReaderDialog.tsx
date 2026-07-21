"use client";

import { Check, Copy, Mail, RefreshCw, UserPlus } from "lucide-react";
import { useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function InviteReaderDialog({
  triggerVariant = "outline",
}: {
  triggerVariant?: ButtonProps["variant"];
}) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const portalUrl = "https://betaquill.app/read/the-last-cartographer";

  async function copyPortalUrl() {
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant} className={triggerVariant === "outline" ? "border-primary text-primary" : undefined}>
          <UserPlus className="h-3.5 w-3.5" />
          Invite reader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">Invite a reader</DialogTitle>
          <DialogDescription>
            Share the reader portal or send a personal invitation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share link</TabsTrigger>
            <TabsTrigger value="email">Invite by email</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="portal-link">Reader portal</Label>
              <div className="flex gap-2">
                <Input id="portal-link" value={portalUrl} readOnly className="h-10 font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copyPortalUrl} aria-label="Copy reader portal link">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="border bg-muted/35 p-4 text-xs leading-5 text-muted-foreground">
              4 of 5 reader slots are in use. Readers can open the manuscript,
              track progress, and add tagged annotations.
            </div>
            <Button variant="ghost" size="sm" className="px-0">
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate link
            </Button>
          </TabsContent>
          <TabsContent value="email" className="space-y-4 pt-4">
            {sent ? (
              <div className="border border-success/25 bg-success/5 p-5 text-sm">
                <p className="font-medium text-success">Invitation sent</p>
                <p className="mt-1 text-muted-foreground">
                  They will receive the manuscript link and your note.
                </p>
                <Button variant="link" className="mt-3" onClick={() => setSent(false)}>
                  Invite another
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reader-email">Email address</Label>
                  <Input id="reader-email" type="email" placeholder="reader@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reader-note">Personal note</Label>
                  <Textarea id="reader-note" placeholder="A quick note about what feedback would help..." />
                </div>
                <Button className="w-full" onClick={() => setSent(true)}>
                  <Mail className="h-4 w-4" />
                  Send invitation
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
