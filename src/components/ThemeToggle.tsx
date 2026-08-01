"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const storageKey = "betaquill.theme";
const isThemeToggleAvailable = false;

function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey) return;

    const nextTheme: Theme = event.newValue === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.dataset.theme = nextTheme;
    onStoreChange();
  };

  window.addEventListener("betaquillthemechange", onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("betaquillthemechange", onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

type ThemeToggleProps = {
  className?: string;
  label?: boolean;
};

export function ThemeToggle({ className, label = false }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light");

  if (!isThemeToggleAvailable) return null;

  function toggleTheme() {
    const nextTheme: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // The session still changes when storage is unavailable.
    }
    window.dispatchEvent(new Event("betaquillthemechange"));
  }

  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 border border-foreground/20 px-2.5 text-foreground transition-colors hover:bg-foreground/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        !label && "w-9 px-0",
        className,
      )}
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="h-3.5 w-3.5" strokeWidth={1.6} /> : <Moon className="h-3.5 w-3.5" strokeWidth={1.6} />}
      {label ? <span className="text-[10px] uppercase tracking-[0.12em]">{isDark ? "Light mode" : "Dark mode"}</span> : null}
    </button>
  );
}
