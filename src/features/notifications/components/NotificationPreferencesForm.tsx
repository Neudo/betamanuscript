"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  defaultAuthorNotificationPreferences,
  getAuthorNotificationPreferences,
  saveAuthorNotificationPreferences,
  type AuthorNotificationPreferences,
} from "@/features/notifications/api/notifications";
import { Heading } from "@/shared/ui/Heading";

const preferenceOptions: Array<{
  description: string;
  key: keyof AuthorNotificationPreferences;
  title: string;
}> = [
  {
    key: "newAnnotation",
    title: "New annotation",
    description: "When a reader leaves feedback in the manuscript.",
  },
  {
    key: "surveyResponse",
    title: "Survey response",
    description: "When a reader completes a chapter or manuscript survey.",
  },
  {
    key: "readerProgress",
    title: "Reader progress",
    description: "When a reader completes their first or final chapter.",
  },
];

const emailNotificationOptions = [
  {
    title: "Reader starts reading",
    description: "When a reader records their first reading progress.",
  },
  {
    title: "Survey response",
    description: "When a reader submits a survey response.",
  },
  {
    title: "All readers finished",
    description: "When every invited reader has finished the manuscript.",
  },
];

export function NotificationPreferencesForm({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient();
  const preferencesQuery = useQuery({
    queryKey: ["author-notification-preferences", profileId],
    queryFn: () => getAuthorNotificationPreferences(profileId),
  });
  const [pendingPreferences, setPendingPreferences] = useState<AuthorNotificationPreferences | null>(null);
  const preferences = pendingPreferences ?? preferencesQuery.data ?? defaultAuthorNotificationPreferences;

  const savePreferences = useMutation({
    mutationFn: () => saveAuthorNotificationPreferences(profileId, preferences),
    onSuccess() {
      queryClient.setQueryData(["author-notification-preferences", profileId], preferences);
      setPendingPreferences(null);
      toast.success("Notification preferences saved.");
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  if (preferencesQuery.isError) {
    return <p className="py-5 text-sm text-destructive">{preferencesQuery.error.message}</p>;
  }

  return (
    <>
      <div className="divide-y divide-foreground/[0.08]">
        {preferenceOptions.map((option) => (
          <div key={option.key} className="grid gap-4 border-b border-foreground/[0.08] py-5 sm:grid-cols-[230px_minmax(0,1fr)] sm:gap-8">
            <div>
              <Heading level={2} size="small">{option.title}</Heading>
              <p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">{option.description}</p>
            </div>
            <div className="flex items-center">
              <Switch
                checked={preferences[option.key]}
                disabled={preferencesQuery.isLoading || savePreferences.isPending}
                aria-label={option.title}
                onCheckedChange={(checked) => {
                  setPendingPreferences((current) => ({ ...(current ?? preferences), [option.key]: checked }));
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end py-5">
        <Button size="sm" disabled={preferencesQuery.isLoading || savePreferences.isPending} onClick={() => savePreferences.mutate()}>
          {savePreferences.isPending ? "Saving..." : "Save preferences"}
        </Button>
      </div>
      <section className="border-t border-foreground/[0.08] py-7">
        <Heading level={2} size="small">Email notifications</Heading>
        <p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">Choose which reader milestones should arrive in your inbox.</p>
        <div className="relative mt-5 overflow-hidden border border-foreground/[0.08]">
          <div className="divide-y divide-foreground/[0.08] opacity-40" aria-hidden="true">
            {emailNotificationOptions.map((option) => (
              <div key={option.title} className="grid gap-4 px-5 py-5 sm:grid-cols-[230px_minmax(0,1fr)] sm:gap-8">
                <div>
                  <Heading level={3} size="small">{option.title}</Heading>
                  <p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">{option.description}</p>
                </div>
                <div className="flex items-center">
                  <Switch checked={false} disabled aria-label={option.title} />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 grid place-items-center bg-background/75 backdrop-blur-[1px]">
            <span className="border border-foreground/15 bg-background px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-foreground">Coming soon</span>
          </div>
        </div>
      </section>
    </>
  );
}
