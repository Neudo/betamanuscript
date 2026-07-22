"use client";

import { useMutation } from "@tanstack/react-query";
import { BookOpenText, ChevronDown, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/account/api/sign-out";
import {
  canRead,
  canWrite,
  getRoleLabel,
} from "@/features/account/domain/user-role";
import type { AuthenticatedAccount } from "@/features/account/types";

type WorkspaceAccountMenuProps = {
  account: AuthenticatedAccount;
  currentWorkspace: "reader" | "writer";
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
  currentWorkspace,
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
  const canSwitchToReader = currentWorkspace === "writer" && canRead(account.role);
  const canSwitchToWriter = currentWorkspace === "reader" && canWrite(account.role);

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2 px-3">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
          {getInitials(account.displayName)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[11px] font-medium">
            {account.displayName}
          </span>
          <span className="block truncate font-mono text-[9px] text-muted-foreground">
            {account.email}
          </span>
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-auto w-full justify-between border-foreground/15 bg-transparent px-2.5 py-1.5 text-[10px] font-normal"
          >
            <span className="font-mono text-[9px] text-muted-foreground">Role</span>
            <span className="ml-auto">{getRoleLabel(account.role)}</span>
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Workspace access</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canSwitchToReader ? (
            <DropdownMenuItem asChild>
              <Link href="/reader" onClick={onNavigate} className="text-primary">
                <BookOpenText className="h-3.5 w-3.5" />
                Switch to reader view
              </Link>
            </DropdownMenuItem>
          ) : null}
          {canSwitchToWriter ? (
            <DropdownMenuItem asChild>
              <Link href="/dashboard" onClick={onNavigate} className="text-primary">
                <FileText className="h-3.5 w-3.5" />
                Switch to writer view
              </Link>
            </DropdownMenuItem>
          ) : null}
          {canSwitchToReader || canSwitchToWriter ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            disabled={mutation.isPending}
            onSelect={() => mutation.mutate()}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {mutation.isPending ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {mutation.isError ? (
        <p className="mt-2 px-3 text-[10px] text-destructive">
          {mutation.error.message}
        </p>
      ) : null}
    </div>
  );
}
