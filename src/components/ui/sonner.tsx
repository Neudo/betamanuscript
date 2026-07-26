"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { cn } from "@/lib/utils";

function Toaster({ className, ...props }: ToasterProps) {
  return (
    <Sonner
      className={cn("toaster group", className)}
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          description: "group-[.toast]:text-muted-foreground",
          toast: "group toast group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:shadow-xl",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
