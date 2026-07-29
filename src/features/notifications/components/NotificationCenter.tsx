"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ClipboardList, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAuthorNotifications,
  markAuthorNotificationsRead,
  type AuthorNotification,
} from "@/features/notifications/api/notifications";

const notificationIcons: Record<AuthorNotification["eventType"], typeof Bell> = {
  new_annotation: MessageSquare,
  reader_completed: Users,
  reader_started: Users,
  survey_response: ClipboardList,
};

function formatNotificationTime(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(elapsed / 60_000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(value));
}

export function NotificationCenter({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["author-notifications", profileId],
    queryFn: () => getAuthorNotifications(profileId),
    refetchInterval: 30_000,
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadNotifications = notifications.filter((notification) => !notification.readAt);

  const markRead = useMutation({
    mutationFn: (notificationIds?: string[]) => markAuthorNotificationsRead(profileId, notificationIds),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["author-notifications", profileId] });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={unreadNotifications.length > 0 ? `${unreadNotifications.length} unread notifications` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications.length > 0 ? (
            <span className="absolute right-1 top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-0.5 font-mono text-[8px] leading-none text-primary-foreground">
              {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(23rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadNotifications.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              disabled={markRead.isPending}
              onClick={() => markRead.mutate(unreadNotifications.map((notification) => notification.id))}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />
        {notificationsQuery.isLoading ? <p className="px-4 py-6 text-sm text-muted-foreground">Loading notifications…</p> : null}
        {notificationsQuery.isError ? <p className="px-4 py-6 text-sm text-destructive">{notificationsQuery.error.message}</p> : null}
        {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">You&apos;re all caught up.</p>
        ) : null}
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.eventType];

          return (
            <DropdownMenuItem key={notification.id} asChild className="p-0 focus:bg-foreground/[0.04]">
              <Link
                href={notification.href}
                className="flex items-start gap-3 px-4 py-3"
                onClick={() => {
                  if (!notification.readAt) markRead.mutate([notification.id]);
                }}
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border border-foreground/10 bg-sidebar text-primary">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-foreground">{notification.title}</span>
                    <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{formatNotificationTime(notification.createdAt)}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{notification.body}</span>
                </span>
                {!notification.readAt ? <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
