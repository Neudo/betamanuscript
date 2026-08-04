"use client";

import { useMutation } from "@tanstack/react-query";
import { Bell, Check, CreditCard, Download, LockKeyhole, Shield, Trash2, Upload, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileSettings, uploadProfileAvatar } from "@/features/account/api/profile-settings";
import { RolePicker } from "@/features/account/components/RolePicker";
import { socialPlatformLabels, socialPlatforms, type SocialPlatform } from "@/features/account/domain/social-links";
import { updateRole } from "@/features/account/api/update-role";
import type { WorkspaceRole } from "@/features/account/domain/user-role";
import { profileSettingsSchema } from "@/features/account/schemas/profile-settings.schema";
import type { WorkspaceAuthenticatedAccount } from "@/features/account/server/require-workspace-account";
import type { AuthenticatedAccount } from "@/features/account/types";
import { NotificationPreferencesForm } from "@/features/notifications/components/NotificationPreferencesForm";
import { deleteAccount } from "@/features/settings/api/delete-account";
import { exportAccountData } from "@/features/settings/api/export-account-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { authorPricing } from "@/shared/config/pricing";
import { Heading } from "@/shared/ui/Heading";

const settingsTabs = [
  ["profile", "Profile", UserRound],
  ["notifications", "Notifications", Bell],
  ["account", "Account", Shield],
  ["plan", "Plan", CreditCard],
] as const;

const freePlanBenefits = [
  "1 active manuscript",
  "Up to 5 beta readers",
  "Default annotation tags",
  "Revision dashboard",
  "Reader reading list",
  "2 surveys",
  "Shareable reading pages",
];

const proPlanBenefits = [
  "Unlimited manuscripts",
  "Unlimited beta readers",
  "Custom annotation tags",
  "Advanced revision priorities",
  "Unlimited surveys",
  "CSV & PDF export",
  "Priority support",
];

type BillingInterval = "monthly" | "yearly";

const paidPlanOptions: Array<{
  interval: BillingInterval;
  label: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  badge?: string;
}> = [
  {
    interval: "monthly",
    label: "Monthly",
    price: authorPricing.monthly.price,
    cadence: "/ month",
    description: "Flexible monthly billing. Cancel anytime.",
    cta: "Choose monthly",
  },
  {
    interval: "yearly",
    label: "Yearly",
    price: authorPricing.yearly.price,
    cadence: "/ year",
    description: `Equivalent to ${authorPricing.yearly.monthlyEquivalent}/month, billed annually. Save ${authorPricing.yearly.savings} compared to paying monthly.`,
    cta: "Choose yearly",
    badge: "Best value",
  },
];

type SettingsTab = (typeof settingsTabs)[number][0];

type ProfileInputErrors = {
  bio?: string;
  displayName?: string;
  socialLinks: Partial<Record<SocialPlatform, string>>;
  website?: string;
};

export function SettingsWorkspace({
  account,
  initialTab = "profile",
}: {
  account: WorkspaceAuthenticatedAccount;
  initialTab?: SettingsTab;
}) {
  const router = useRouter();
  const [role, setRole] = useState<WorkspaceRole>(account.role);
  const hasProPlan = account.plan === "pro";
  const currentPlanBenefits = hasProPlan ? proPlanBenefits : freePlanBenefits;
  const roleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess() {
      router.refresh();
    },
  });

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
        <TabsContent value="notifications" className="m-0"><SettingsPage title="In-app notifications"><NotificationPreferencesForm profileId={account.id} /></SettingsPage></TabsContent>
        <TabsContent value="account" className="m-0">
          <SettingsPage title="Account">
            <SettingsRow label="Account role" hint="Controls which workspaces you can access.">
              <div className="space-y-3">
                <RolePicker value={role} onChange={setRole} compact />
                <Button size="sm" disabled={roleMutation.isPending || role === account.role} onClick={() => roleMutation.mutate({ accountId: account.id, role })}>
                  {roleMutation.isPending ? "Updating..." : "Update role"}
                </Button>
                {roleMutation.isError ? <p className="text-xs text-destructive">{roleMutation.error.message}</p> : null}
              </div>
            </SettingsRow>
            <SettingsRow label="Password" hint="Update the password used to sign in.">
              <ChangePasswordButton email={account.email} />
            </SettingsRow>
            <SettingsRow label="Export data" hint="Download your manuscripts, readers, and feedback.">
              <ExportAccountDataButton />
            </SettingsRow>
            <SettingsRow label="Delete account" hint="Permanently removes all manuscripts and feedback.">
              <DeleteAccount />
            </SettingsRow>
          </SettingsPage>
        </TabsContent>
        <TabsContent value="plan" className="m-0">
          <SettingsPage title="Plan">
            <SettingsRow label="Current plan" hint="Your BetaManuscript workspace limits.">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-primary-text">{hasProPlan ? "Paid plan" : "Free plan"}</p>
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
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Remove manuscript and reader limits while keeping every feedback and revision tool in one workspace.
                </p>
                <div className="mt-5 grid gap-4 border border-foreground/15 sm:grid-cols-2">
                  {paidPlanOptions.map((option) => (
                    <section key={option.interval} className="relative flex min-h-64 flex-col border-t border-foreground/10 p-5 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0">
                      {option.badge ? <span className="absolute right-0 top-0 bg-primary px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-primary-foreground">{option.badge}</span> : null}
                      <p className="font-mono text-[9px] uppercase tracking-widest text-primary-text">{option.label}</p>
                      <p className="mt-5 font-display text-4xl leading-none tracking-tight">
                        {option.price} <span className="font-sans text-sm text-muted-foreground">{option.cadence}</span>
                      </p>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">{option.description}</p>
                      <ul className="my-5 space-y-2 text-xs text-muted-foreground">
                        {proPlanBenefits.slice(0, 3).map((item) => (
                          <li key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success" />{item}</li>
                        ))}
                      </ul>
                      <BillingCheckoutButton interval={option.interval} label={option.cta} />
                    </section>
                  ))}
                </div>
              </div>
            </SettingsRow> : <SettingsRow label="Subscription" hint="Update payment details, switch billing interval, or cancel from Stripe’s secure portal."><BillingPortalButton /></SettingsRow>}
          </SettingsPage>
        </TabsContent>
      </div>
    </Tabs>
  );
}

function ProfileSettings({ account }: { account: AuthenticatedAccount }) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPath, setAvatarPath] = useState(account.avatarPath);
  const [avatarUrl, setAvatarUrl] = useState(account.avatarUrl);
  const [bio, setBio] = useState(account.bio);
  const [displayName, setDisplayName] = useState(account.displayName);
  const [socialLinks, setSocialLinks] = useState(account.socialLinks);
  const [website, setWebsite] = useState(account.website);
  const [profileInputErrors, setProfileInputErrors] = useState<ProfileInputErrors>({ socialLinks: {} });
  const profileMutation = useMutation({
    mutationFn: updateProfileSettings,
    onSuccess(profile) {
      setBio(profile.bio);
      setDisplayName(profile.displayName);
      setSocialLinks(profile.socialLinks);
      setWebsite(profile.website);
      toast.success("Profile saved.");
      router.refresh();
    },
  });
  const avatarMutation = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess(avatar) {
      setAvatarPath(avatar.avatarPath);
      setAvatarUrl(avatar.avatarUrl);
      toast.success("Profile photo updated.");
      router.refresh();
    },
  });
  const hasProfileChanges = bio !== account.bio
    || displayName !== account.displayName
    || website !== account.website
    || socialPlatforms.some((platform) => socialLinks[platform] !== account.socialLinks[platform]);
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = profileSettingsSchema.safeParse({ bio, displayName, socialLinks, website });
    if (!validation.success) {
      const errors: ProfileInputErrors = { socialLinks: {} };

      for (const issue of validation.error.issues) {
        const [field, socialPlatform] = issue.path;
        if (field === "bio") errors.bio ??= issue.message;
        if (field === "displayName") errors.displayName ??= issue.message;
        if (field === "website") errors.website ??= issue.message;
        if (
          field === "socialLinks"
          && typeof socialPlatform === "string"
          && socialPlatforms.includes(socialPlatform as SocialPlatform)
        ) {
          errors.socialLinks[socialPlatform as SocialPlatform] ??= issue.message;
        }
      }

      setProfileInputErrors(errors);
      return;
    }

    setProfileInputErrors({ socialLinks: {} });
    profileMutation.mutate({ bio, displayName, socialLinks, website });
  }

  return (
    <form onSubmit={saveProfile} noValidate>
      <SettingsRow label="Avatar" hint="Shown across your BetaManuscript workspace.">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 rounded-none border border-foreground/15">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Your profile photo" className="object-cover" /> : null}
            <AvatarFallback className="rounded-none bg-primary text-xl font-semibold text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) avatarMutation.mutate({ file, previousPath: avatarPath });
              }}
            />
            <Button
              type="button"
              variant="link"
              className="text-sm"
              disabled={avatarMutation.isPending}
              onClick={() => avatarInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {avatarMutation.isPending ? "Uploading photo..." : "Upload photo"}
            </Button>
            <p className="mt-1 font-mono text-[9px] text-muted-foreground">JPG, PNG, or WEBP · 2 MB maximum · square recommended</p>
            {avatarMutation.isError ? <p className="mt-2 text-xs text-destructive">{avatarMutation.error.message}</p> : null}
          </div>
        </div>
      </SettingsRow>
      <SettingsRow label="Display name" hint="The name readers and writers see.">
        <Input
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            setProfileInputErrors((current) => ({ ...current, displayName: undefined }));
          }}
          autoComplete="name"
          maxLength={80}
          aria-invalid={Boolean(profileInputErrors.displayName)}
          aria-describedby={profileInputErrors.displayName ? "display-name-error" : undefined}
          className={cn("h-10 border-foreground/15 bg-transparent", profileInputErrors.displayName && "border-destructive focus-visible:ring-destructive")}
        />
        {profileInputErrors.displayName ? <p id="display-name-error" className="mt-2 text-xs text-destructive">{profileInputErrors.displayName}</p> : null}
      </SettingsRow>
      <SettingsRow label="Email" hint="Used for login and notifications.">
        <div>
          <div className="relative">
            <Input value={account.email} readOnly aria-readonly="true" type="email" className="h-10 border-foreground/15 bg-muted/40 pr-10 text-muted-foreground" />
            <LockKeyhole aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole aria-hidden="true" className="h-3 w-3" />Managed by your sign-in method</p>
        </div>
      </SettingsRow>
      <SettingsRow label="Author bio" hint="Optional context for your author profile.">
        <Textarea
          value={bio}
          onChange={(event) => {
            setBio(event.target.value);
            setProfileInputErrors((current) => ({ ...current, bio: undefined }));
          }}
          maxLength={2_000}
          aria-invalid={Boolean(profileInputErrors.bio)}
          aria-describedby={profileInputErrors.bio ? "author-bio-error" : undefined}
          className={cn("min-h-24 border-foreground/15 bg-transparent", profileInputErrors.bio && "border-destructive focus-visible:ring-destructive")}
        />
        {profileInputErrors.bio ? <p id="author-bio-error" className="mt-2 text-xs text-destructive">{profileInputErrors.bio}</p> : null}
      </SettingsRow>
      <SettingsRow label="Website" hint="Optional link associated with your profile.">
        <div>
          <Input
            value={website}
            onChange={(event) => {
              setWebsite(event.target.value);
              setProfileInputErrors((current) => ({ ...current, website: undefined }));
            }}
            inputMode="url"
            placeholder="https://yourwebsite.com"
            maxLength={2_048}
            aria-invalid={Boolean(profileInputErrors.website)}
            aria-describedby={profileInputErrors.website ? "website-error" : undefined}
            className={cn("h-10 border-foreground/15 bg-transparent", profileInputErrors.website && "border-destructive focus-visible:ring-destructive")}
          />
          {profileInputErrors.website ? <p id="website-error" className="mt-2 text-xs text-destructive">{profileInputErrors.website}</p> : null}
        </div>
      </SettingsRow>
      <SettingsRow label="Social links" hint="Optional links readers can see in your author details.">
        <div className="grid gap-3 sm:grid-cols-2">
          {socialPlatforms.map((platform) => (
            <label key={platform} className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {socialPlatformLabels[platform]}
              </span>
              <Input
                value={socialLinks[platform]}
                onChange={(event) => {
                  setSocialLinks((current) => ({
                    ...current,
                    [platform]: event.target.value,
                  }));
                  setProfileInputErrors((current) => ({
                    ...current,
                    socialLinks: { ...current.socialLinks, [platform]: undefined },
                  }));
                }}
                inputMode="url"
                placeholder="https://"
                maxLength={2_048}
                aria-invalid={Boolean(profileInputErrors.socialLinks[platform])}
                aria-describedby={profileInputErrors.socialLinks[platform] ? `social-link-${platform}-error` : undefined}
                className={cn("h-10 border-foreground/15 bg-transparent", profileInputErrors.socialLinks[platform] && "border-destructive focus-visible:ring-destructive")}
              />
              {profileInputErrors.socialLinks[platform] ? (
                <p id={`social-link-${platform}-error`} className="text-xs text-destructive">
                  {profileInputErrors.socialLinks[platform]}
                </p>
              ) : null}
            </label>
          ))}
        </div>
      </SettingsRow>
      {profileMutation.isError ? <p className="mt-4 text-xs text-destructive">{profileMutation.error.message}</p> : null}
      <SettingsFooter><Button size="sm" type="submit" disabled={!hasProfileChanges || profileMutation.isPending}>{profileMutation.isPending ? "Saving..." : "Save profile"}</Button></SettingsFooter>
    </form>
  );
}

function SettingsPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><header className="border-b border-foreground/10 px-5 py-5 sm:px-8"><p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Settings</p><Heading level={1} size="workspace">{title}</Heading></header><div className="max-w-[920px] px-5 py-3 sm:px-8">{children}</div></div>;
}

function SettingsRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return <div className="grid gap-4 border-b border-foreground/[0.08] py-5 sm:grid-cols-[230px_minmax(0,1fr)] sm:gap-8"><div><Heading level={2} size="small">{label}</Heading><p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">{hint}</p></div><div className="min-w-0">{children}</div></div>;
}

function SettingsFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end py-5">{children}</div>;
}

function BillingCheckoutButton({ interval, label }: { interval: BillingInterval; label: string }) {
  const [isPending, setIsPending] = useState(false);

  async function startCheckout() {
    setIsPending(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const payload = await response.json().catch(() => null) as { error?: string; url?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Unable to start secure checkout.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start secure checkout.");
      setIsPending(false);
    }
  }

  return <Button size="sm" className="mt-auto w-full" disabled={isPending} onClick={startCheckout}>{isPending ? "Opening secure checkout..." : label}</Button>;
}



function BillingPortalButton() {
  const [isPending, setIsPending] = useState(false);

  async function openPortal() {
    setIsPending(true);

    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = await response.json().catch(() => null) as { error?: string; url?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Unable to open subscription management.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open subscription management.");
      setIsPending(false);
    }
  }

  return <Button size="sm" onClick={openPortal} disabled={isPending}>{isPending ? "Opening subscription management..." : "Manage subscription"}</Button>;
}

function ChangePasswordButton({ email }: { email: string }) {
  const mutation = useMutation({
    async mutationFn() {
      if (!email) {
        throw new Error("Your sign-in method does not have an email address.");
      }

      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("intent", "password-recovery");

      const { error } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo.toString(),
      });

      if (error) throw new Error(error.message);
    },
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Unable to send a password reset email.");
    },
    onSuccess() {
      toast.success("Password reset email sent. Check your inbox to choose a new password.");
    },
  });

  return (
    <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? "Sending reset email..." : "Change password"}
    </Button>
  );
}

function ExportAccountDataButton() {
  const mutation = useMutation({
    mutationFn: exportAccountData,
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Unable to export account data.");
    },
    onSuccess() {
      toast.success("Account data downloaded.");
    },
  });

  return (
    <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      <Download className="h-3.5 w-3.5" />
      {mutation.isPending ? "Preparing export..." : "Export account data"}
    </Button>
  );
}

function DeleteAccount() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const mutation = useMutation({
    mutationFn: deleteAccount,
    async onSuccess() {
      setIsOpen(false);

      try {
        await createSupabaseBrowserClient().auth.signOut({ scope: "local" });
      } finally {
        router.replace("/");
        router.refresh();
      }
    },
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete your account.");
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!mutation.isPending) {
      setIsOpen(nextOpen);

      if (!nextOpen) {
        setConfirmation("");
      }
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={mutation.isPending}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your BetaManuscript account?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. It permanently deletes your account, manuscripts, reader feedback, and uploaded files. Any active subscription is cancelled immediately. Export anything you need before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <label htmlFor="delete-account-confirmation" className="text-sm font-medium">
            Type DELETE to confirm
          </label>
          <Input
            id="delete-account-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            disabled={mutation.isPending}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={confirmation !== "DELETE" || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Deleting account..." : "Delete account"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
