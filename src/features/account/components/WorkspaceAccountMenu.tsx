"use client";

import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/account/api/sign-out";
import type { AuthenticatedAccount } from "@/features/account/types";

type WorkspaceAccountMenuProps = {
  account: AuthenticatedAccount;
  onNavigate?: () => void;
};

function getInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function WorkspaceAccountMenu({
  account,
  onNavigate,
}: WorkspaceAccountMenuProps) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: signOut,
    onSuccess() {
      onNavigate?.();
      router.replace("/");
      router.refresh();
    },
  });
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2 px-3">
        <Avatar className="h-6 w-6 shrink-0">
          {account.avatarUrl ? <AvatarImage src={account.avatarUrl} alt="" className="object-cover" /> : null}
          <AvatarFallback className="bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
            {getInitials(account.displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium">
            {account.displayName}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="min-w-0 flex-1 truncate font-mono text-[9px] text-muted-foreground">
              {account.email}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              aria-label={mutation.isPending ? "Logging out" : "Log out"}
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </span>
        </span>
      </div>
      {mutation.isError ? (
        <p className="mt-2 px-3 text-[10px] text-destructive">
          {mutation.error.message}
        </p>
      ) : null}
    </div>
  );
}
