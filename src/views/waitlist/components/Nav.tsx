"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { INK, INVERSE_FOREGROUND, SANS, premiumEase } from "../../../shared/config/design-tokens";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const navigationLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-readers", label: "For readers" },
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const reduceMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-xs md:flex"
        style={{ color: INK, fontFamily: SANS }}
      >
        {navigationLinks.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:opacity-65">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="hidden items-center gap-4 md:flex">
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
      <div className="flex items-center gap-2 md:hidden">
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

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence initial={false}>
            {isMobileMenuOpen ? (
              <motion.div
                id="mobile-navigation"
                className="fixed inset-x-0 bottom-0 z-30 border-t px-6 py-5 shadow-[0_-16px_40px_hsl(var(--ink)/0.14)] md:hidden"
                style={{ borderColor: "hsl(var(--border) / 0.72)", background: "hsl(var(--paper) / 0.98)", backdropFilter: "blur(12px)" }}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                transition={{ duration: 0.2, ease: premiumEase }}
              >
                <div className="mx-auto grid max-w-md gap-px border" style={{ borderColor: "hsl(var(--border) / 0.92)", background: "hsl(var(--border) / 0.92)" }}>
                  {navigationLinks.map((link) => (
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
