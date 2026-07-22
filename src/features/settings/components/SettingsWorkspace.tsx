"use client";

import { useMutation } from "@tanstack/react-query";
import { Bell, BookOpen, Check, Copy, CreditCard, Download, Shield, Trash2, Upload, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RolePicker } from "@/features/account/components/RolePicker";
import { updateRole } from "@/features/account/api/update-role";
import type { UserRole } from "@/features/account/domain/user-role";
import type { AuthenticatedAccount } from "@/features/account/types";

const notificationOptions = [
  ["New annotation", "When a reader leaves feedback in the manuscript."],
  ["Survey response", "When a reader completes a chapter or book survey."],
  ["Reader progress", "When a reader starts or finishes your manuscript."],
  ["Weekly digest", "A weekly summary of activity and repeated signals."],
];

const socialFields = [
  ["Substack", "substack.com/"],
  ["Goodreads", "goodreads.com/author/"],
  ["Bluesky", "bsky.app/profile/"],
  ["X / Twitter", "x.com/"],
  ["Instagram", "instagram.com/"],
  ["TikTok", "tiktok.com/@"],
];

const settingsTabs = [
  ["profile", "Profile", UserRound],
  ["notifications", "Notifications", Bell],
  ["portal", "Reader portal", BookOpen],
  ["account", "Account", Shield],
  ["plan", "Plan", CreditCard],
] as const;

const freePlanBenefits = [
  "Limited to 1 manuscript",
  "Up to 5 active readers",
  "Unlimited annotations",
  "Reader surveys",
  "Revision priorities",
  "Data export",
];

const proPlanBenefits = [
  "Unlimited manuscripts",
  "Unlimited active beta readers",
  "Unlimited annotations",
  "Reader surveys",
  "Revision priorities",
  "Data export",
];

type SettingsTab = (typeof settingsTabs)[number][0];

export function SettingsWorkspace({
  account,
  initialTab = "profile",
}: {
  account: AuthenticatedAccount;
  initialTab?: SettingsTab;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(account.role);
  const [copied, setCopied] = useState(false);
  const hasProPlan = account.plan === "pro";
  const currentPlanBenefits = hasProPlan ? proPlanBenefits : freePlanBenefits;
  const roleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess() {
      router.refresh();
    },
  });

  async function copyPortal() {
    await navigator.clipboard.writeText("https://betamanuscript.app/read/the-last-cartographer");
    setCopied(true);
  }

  return (
    <Tabs defaultValue={initialTab} orientation="vertical" className="min-h-full md:grid md:h-full md:grid-cols-[210px_minmax(0,1fr)] md:overflow-hidden">
      <aside className="border-b border-foreground/10 bg-sidebar px-3 py-6 md:border-b-0 md:border-r">
        <p className="mb-4 px-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Settings</p>
        <TabsList className="h-auto w-full flex-row flex-wrap items-stretch justify-start gap-1 rounded-none bg-transparent p-0 md:flex-col">
          {settingsTabs.map(([value, label, Icon]) => (
            <TabsTrigger key={value} value={value} className="h-10 justify-start gap-3 rounded-none border-l-2 border-transparent px-3 text-sm text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-foreground/[0.07] data-[state=active]:text-foreground data-[state=active]:shadow-none">
              <Icon className="h-4 w-4" strokeWidth={1.5} />{label}
            </TabsTrigger>
          ))}
        </TabsList>
      </aside>

      <div className="min-w-0 md:h-full md:overflow-y-auto">
        <TabsContent value="profile" className="m-0"><SettingsPage title="Profile"><ProfileSettings account={account} /></SettingsPage></TabsContent>
        <TabsContent value="notifications" className="m-0"><SettingsPage title="Notifications"><div className="divide-y divide-foreground/[0.08]">{notificationOptions.map(([title, description], index) => <SettingsRow key={title} label={title} hint={description}><Switch defaultChecked={index !== 2} aria-label={title} /></SettingsRow>)}</div><SettingsFooter><Button size="sm">Save preferences</Button></SettingsFooter></SettingsPage></TabsContent>
        <TabsContent value="portal" className="m-0"><SettingsPage title="Reader portal"><SettingsRow label="Welcome message" hint="Shown before readers open your manuscript."><Textarea className="min-h-28 border-foreground/15 bg-transparent" defaultValue="Thank you for reading. Honest, specific feedback is the most useful gift you can give this draft." /></SettingsRow><SettingsRow label="Show author profile" hint="Display your bio and public links."><Switch defaultChecked /></SettingsRow><SettingsRow label="Portal link" hint="Share this private link with invited readers."><div className="flex gap-2"><Input value="https://betamanuscript.app/read/the-last-cartographer" readOnly className="h-10 border-foreground/15 bg-transparent font-mono text-xs" /><Button variant="outline" size="icon" onClick={copyPortal} aria-label="Copy portal link">{copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</Button></div></SettingsRow><SettingsFooter><Button size="sm">Save portal</Button></SettingsFooter></SettingsPage></TabsContent>
        <TabsContent value="account" className="m-0"><SettingsPage title="Account"><SettingsRow label="Account role" hint="Controls which workspaces you can access."><div className="space-y-3"><RolePicker value={role} onChange={setRole} compact /><Button size="sm" disabled={roleMutation.isPending || role === account.role} onClick={() => roleMutation.mutate({ accountId: account.id, role })}>{roleMutation.isPending ? "Updating..." : "Update role"}</Button>{roleMutation.isError ? <p className="text-xs text-destructive">{roleMutation.error.message}</p> : null}</div></SettingsRow><SettingsRow label="Password" hint="Update the password used to sign in."><Button variant="outline" size="sm">Change password</Button></SettingsRow><SettingsRow label="Export data" hint="Download your manuscripts, readers, and feedback."><Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" />Export account data</Button></SettingsRow><SettingsRow label="Delete account" hint="Permanently removes all manuscripts and feedback."><DeleteAccount /></SettingsRow></SettingsPage></TabsContent>
        <TabsContent value="plan" className="m-0">
          <SettingsPage title="Plan">
            <SettingsRow label="Current plan" hint="Your BetaManuscript workspace limits.">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-primary">{hasProPlan ? "Paid plan" : "Free plan"}</p>
                <p className="mt-2 text-xl font-medium">{hasProPlan ? "Pro" : "Free"}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {hasProPlan
                    ? "Manage unlimited manuscripts and active beta readers from one workspace."
                    : "Create your first manuscript and work with up to 5 active beta readers at no cost."}
                </p>
              </div>
            </SettingsRow>
            <SettingsRow label="Included" hint={`Available on the ${hasProPlan ? "Pro" : "free"} plan.`}>
              <ul className="grid gap-3 text-sm sm:grid-cols-2">
                {currentPlanBenefits.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </SettingsRow>
            {!hasProPlan ? <SettingsRow label="Pro plan" hint="For writers managing multiple manuscripts and larger reader groups.">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-primary">Paid plan</p>
                    <p className="mt-2 text-xl font-medium">Pro</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-2xl font-medium text-foreground">$9.99</span> / month
                  </p>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Remove manuscript and reader limits while keeping every feedback and revision tool in one workspace.
                </p>
                <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {proPlanBenefits.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </SettingsRow> : null}
          </SettingsPage>
        </TabsContent>
      </div>
    </Tabs>
  );
}

function ProfileSettings({ account }: { account: AuthenticatedAccount }) {
  return (
    <>
      <SettingsRow label="Avatar" hint="Shown on the reader portal and in emails."><div className="flex items-center gap-5"><span className="grid h-16 w-16 place-items-center bg-primary text-xl font-semibold text-primary-foreground">{account.displayName.slice(0, 2).toUpperCase()}</span><div><Button variant="link" className="text-sm"><Upload className="h-3.5 w-3.5" />Upload photo</Button><p className="mt-1 font-mono text-[9px] text-muted-foreground">JPG or PNG, square recommended</p></div></div></SettingsRow>
      <SettingsRow label="Display name" hint="Your public author name."><Input defaultValue={account.displayName} className="h-10 border-foreground/15 bg-transparent" /></SettingsRow>
      <SettingsRow label="Email" hint="Used for login and notifications."><Input value={account.email} readOnly type="email" className="h-10 border-foreground/15 bg-transparent" /></SettingsRow>
      <SettingsRow label="Author bio" hint="Shown to readers on the portal."><Textarea className="min-h-24 border-foreground/15 bg-transparent" defaultValue="Novelist working on my second manuscript. Interested in speculative literary fiction." /></SettingsRow>
      <SettingsRow label="Website" hint="Optional link shown to readers."><Input defaultValue="joharper.com" className="h-10 border-foreground/15 bg-transparent" /></SettingsRow>
      <SettingsRow label="Social media" hint="Enter only your handle or path."><div className="grid gap-2 sm:grid-cols-2">{socialFields.map(([label, prefix]) => <div key={label} className="flex h-9 border border-foreground/15"><span className="flex items-center border-r border-foreground/10 bg-sidebar/50 px-2 font-mono text-[8px] text-muted-foreground">{prefix}</span><input className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" aria-label={label} /></div>)}</div></SettingsRow>
      <SettingsFooter><Button size="sm">Save changes</Button></SettingsFooter>
    </>
  );
}

function SettingsPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><header className="border-b border-foreground/10 px-5 py-5 sm:px-8"><p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Settings</p><h1 className="text-[28px] font-medium leading-tight tracking-normal">{title}</h1></header><div className="max-w-[920px] px-5 py-3 sm:px-8">{children}</div></div>;
}

function SettingsRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return <div className="grid gap-4 border-b border-foreground/[0.08] py-5 sm:grid-cols-[230px_minmax(0,1fr)] sm:gap-8"><div><h2 className="text-sm font-medium">{label}</h2><p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">{hint}</p></div><div className="min-w-0">{children}</div></div>;
}

function SettingsFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end py-5">{children}</div>;
}

function DeleteAccount() {
  return <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5" />Delete account</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete your BetaManuscript account?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Export anything you need before continuing.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete account</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
