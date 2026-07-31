"use client";

import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  grantManualProEntitlement,
  revokeManualProEntitlement,
} from "@/features/admin/server/manage-manual-pro-entitlements";
import type { ManualProEntitlement } from "@/features/admin/server/get-manual-pro-entitlements";
import { Heading } from "@/shared/ui/Heading";

type ManualProDuration = "permanent" | "30_days" | "90_days" | "1_year";

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ManualProEntitlements({
  entitlements,
}: {
  entitlements: ManualProEntitlement[];
}) {
  const [profileId, setProfileId] = useState("");
  const [duration, setDuration] = useState<ManualProDuration>("permanent");
  const [isPending, startTransition] = useTransition();

  function handleGrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const result = await grantManualProEntitlement({ duration, profileId });
        setProfileId("");
        toast.success(
          result.expiresAt
            ? `Pro access granted to ${result.displayName} until ${dateFormat.format(new Date(result.expiresAt))}.`
            : `Permanent Pro access granted to ${result.displayName}.`,
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to grant manual Pro access.");
      }
    });
  }

  function handleRevoke(entitlement: ManualProEntitlement) {
    startTransition(async () => {
      try {
        await revokeManualProEntitlement(entitlement.profileId);
        toast.success(`Manual Pro access revoked for ${entitlement.displayName}.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to revoke manual Pro access.");
      }
    });
  }

  return (
    <section className="mt-5 border border-foreground/15 bg-card" aria-labelledby="manual-pro-heading">
      <div className="border-b border-foreground/15 px-4 py-3 sm:px-5">
        <Heading level={2} size="label" id="manual-pro-heading">
          Manual Pro access
        </Heading>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Gift or trial access that stays separate from Stripe subscriptions.
        </p>
      </div>

      <form className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end sm:p-5" onSubmit={handleGrant}>
        <div className="space-y-1.5">
          <Label htmlFor="manual-pro-profile-id">Account ID</Label>
          <Input
            id="manual-pro-profile-id"
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
            placeholder="UUID from Supabase"
            autoComplete="off"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="manual-pro-duration">Duration</Label>
          <select
            id="manual-pro-duration"
            value={duration}
            onChange={(event) => setDuration(event.target.value as ManualProDuration)}
            className="flex h-12 w-full rounded-md border border-input bg-card px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="permanent">Permanent</option>
            <option value="30_days">30 days</option>
            <option value="90_days">90 days</option>
            <option value="1_year">1 year</option>
          </select>
        </div>
        <Button type="submit" disabled={isPending} className="sm:min-w-28">
          Grant Pro
        </Button>
      </form>

      <div className="border-t border-foreground/15">
        {entitlements.length === 0 ? (
          <p className="px-4 py-3 text-xs text-muted-foreground sm:px-5">No manual Pro access is active.</p>
        ) : (
          <ul className="divide-y divide-foreground/15">
            {entitlements.map((entitlement) => (
              <li key={entitlement.profileId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{entitlement.displayName}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{entitlement.profileId}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
                  {entitlement.expiresAt
                    ? `Until ${dateFormat.format(new Date(entitlement.expiresAt))}`
                    : "Permanent"}
                </Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleRevoke(entitlement)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
