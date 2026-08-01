import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";
import { SupportEmailLink } from "@/shared/ui/SupportEmailLink";
import {
  BODY,
  MONO,
  MUTED,
  PAPER,
} from "../../../shared/config/design-tokens";

export function Footer() {
  return (
    <footer
      className="relative z-10 border-t px-6 py-10 md:px-12 md:py-12"
      style={{ borderColor: "hsl(var(--ink) / 0.1)", background: PAPER }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,0.65fr))]">
          <div className="max-w-xs">
            <BrandLogo href="/" imageClassName="h-7" />
            <p className="mt-4 text-sm leading-6" style={{ color: BODY }}>
              A focused workspace for authors who turn reader reactions into better revisions.
            </p>
          </div>

          <FooterGroup title="Explore">
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/how-it-works">How it works</FooterLink>
            <FooterLink href="/for-readers">For readers</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/signup">Start for free</FooterLink>
          </FooterGroup>

          <FooterGroup title="Account">
            <FooterLink href="/login">Log in</FooterLink>
            <FooterLink href="/signup">Create account</FooterLink>
            <SupportEmailLink className="block text-xs leading-6 text-[hsl(var(--body))] transition-colors hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              Contact
            </SupportEmailLink>
          </FooterGroup>

          <FooterGroup title="Legal">
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
          </FooterGroup>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-5 text-[10px] sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "hsl(var(--ink) / 0.1)", fontFamily: MONO, color: MUTED }}>
          <p>© 2026 BetaManuscript. All rights reserved.</p>
          <p>Built for considered, human feedback.</p>
        </div>
      </div>

    </footer>
  );
}

function FooterGroup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTED, fontFamily: MONO }}>{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function FooterLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      className="block text-xs leading-6 text-[hsl(var(--body))] transition-colors hover:text-primary-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      href={href}
    >
      {children}
    </Link>
  );
}
