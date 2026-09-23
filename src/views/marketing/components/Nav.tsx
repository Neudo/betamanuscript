"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { INK, INVERSE_FOREGROUND, SANS, premiumEase } from "../../../shared/config/design-tokens";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const navigationLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-readers", label: "For readers" },
  { href: "/pricing", label: "Pricing" },
];

const useCaseLinks = [
  { href: "/use-cases/manage-multiple-beta-readers", label: "Manage multiple beta readers" },
  { href: "/use-cases/organize-beta-reader-feedback", label: "Organize beta reader feedback" },
  { href: "/use-cases/google-docs-alternative-for-beta-reading", label: "Google Docs alternative for beta reading" },
  { href: "/use-cases/track-beta-reader-progress", label: "Track beta reader progress" },
  { href: "/use-cases/share-manuscript-with-beta-readers", label: "Share a manuscript with beta readers" },
  { href: "/use-cases/beta-reader-surveys", label: "Beta reader surveys" },
];

export function Nav() {
  const reduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isHydrated = useHydrated();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let isMounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setIsAuthenticated(Boolean(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <motion.nav
      className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4 md:px-12"
      style={{ borderColor: "hsl(var(--border) / 0.72)", background: "hsl(var(--paper) / 0.94)", backdropFilter: "blur(8px)" }}
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: premiumEase }}
    >
      <BrandLogo href="/" priority imageClassName="h-12" />
      <div
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-xs lg:flex"
        style={{ color: INK, fontFamily: SANS }}
      >
        <Link href="/how-it-works" className="transition-colors hover:opacity-65">How it works</Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex items-center gap-1 transition-colors hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Use cases
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-80 rounded-none border-foreground/15 bg-card p-1 shadow-[0_12px_32px_rgba(28,24,18,0.14)]">
            <DropdownMenuItem asChild className="rounded-none px-3 py-2.5 text-xs focus:bg-foreground/[0.05]">
              <Link href="/use-cases">All use cases</Link>
            </DropdownMenuItem>
            {useCaseLinks.map((link) => (
              <DropdownMenuItem key={link.href} asChild className="rounded-none px-3 py-2.5 text-xs focus:bg-foreground/[0.05]">
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {navigationLinks.slice(1).map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:opacity-65">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="hidden items-center gap-4 lg:flex">
        <ThemeToggle />
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="border px-4 py-2 text-sm transition-colors hover:bg-foreground/[0.06]"
            style={{ borderColor: "hsl(var(--border) / 0.95)", color: INK, fontFamily: SANS }}
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm transition-colors hover:opacity-65"
              style={{ color: INK, fontFamily: SANS }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="border px-4 py-2 text-sm transition-colors hover:bg-foreground/[0.06]"
              style={{ borderColor: "hsl(var(--border) / 0.95)", color: INK, fontFamily: SANS }}
            >
              Start for free
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        <ThemeToggle />
        <button
          type="button"
          className="grid h-9 w-9 place-items-center border"
          style={{ borderColor: "hsl(var(--border) / 0.95)", color: INK }}
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isHydrated &&
        createPortal(
          <AnimatePresence initial={false}>
            {isMobileMenuOpen ? (
              <motion.div
                id="mobile-navigation"
                className="fixed inset-x-0 bottom-0 z-30 border-t px-6 py-5 shadow-[0_-16px_40px_hsl(var(--ink)/0.14)] lg:hidden"
                style={{ borderColor: "hsl(var(--border) / 0.72)", background: "hsl(var(--paper) / 0.98)", backdropFilter: "blur(12px)" }}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                transition={{ duration: 0.2, ease: premiumEase }}
              >
                <div className="mx-auto grid max-w-md gap-px border" style={{ borderColor: "hsl(var(--border) / 0.92)", background: "hsl(var(--border) / 0.92)" }}>
                  <Link
                    href="/how-it-works"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm transition-colors hover:bg-foreground/[0.06]"
                    style={{ background: "hsl(var(--paper) / 0.98)", color: INK, fontFamily: SANS }}
                  >
                    How it works
                  </Link>
                  <div style={{ background: "hsl(var(--paper) / 0.98)" }}>
                    <Link
                      href="/use-cases"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm transition-colors hover:bg-foreground/[0.06]"
                      style={{ color: INK, fontFamily: SANS }}
                    >
                      Use cases
                    </Link>
                    <div className="border-t py-1 pl-4" style={{ borderColor: "hsl(var(--border) / 0.75)" }}>
                      {useCaseLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-xs leading-5 transition-colors hover:bg-foreground/[0.06]"
                          style={{ color: INK, fontFamily: SANS }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {navigationLinks.slice(1).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm transition-colors hover:bg-foreground/[0.06]"
                      style={{ background: "hsl(var(--paper) / 0.98)", color: INK, fontFamily: SANS }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                {isAuthenticated ? (
                  <div className="mx-auto mt-4 max-w-md">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-11 items-center justify-center border text-sm transition-colors hover:opacity-90"
                      style={{ borderColor: INK, background: INK, color: INVERSE_FOREGROUND, fontFamily: SANS }}
                    >
                      Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-11 items-center justify-center border text-sm transition-colors hover:bg-foreground/[0.06]"
                      style={{ borderColor: "hsl(var(--border) / 0.95)", color: INK, fontFamily: SANS }}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex min-h-11 items-center justify-center border text-sm transition-colors hover:opacity-90"
                      style={{ borderColor: INK, background: INK, color: INVERSE_FOREGROUND, fontFamily: SANS }}
                    >
                      Start for free
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </motion.nav>
  );
}
