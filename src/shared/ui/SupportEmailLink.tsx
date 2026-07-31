"use client";

import { type ButtonHTMLAttributes, type ReactNode, useCallback } from "react";

const EMAIL_KEY = 0x5a;
const OBFUSCATED_SUPPORT_EMAIL = [
  41, 47, 42, 42, 53, 40, 46, 26, 56, 63, 46, 59, 55, 59, 52, 47, 41, 57,
  40, 51, 42, 46, 116, 57, 53, 55,
];

function getSupportEmail() {
  return String.fromCharCode(
    ...OBFUSCATED_SUPPORT_EMAIL.map((character) => character ^ EMAIL_KEY),
  );
}

type SupportEmailLinkProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "type"
> & {
  children?: ReactNode;
};

/**
 * Keeps the support address out of the rendered HTML and only reconstructs it
 * when a visitor explicitly asks to compose an email.
 */
export function SupportEmailLink({
  children = "Email support",
  className,
  ...buttonProps
}: SupportEmailLinkProps) {
  const handleClick = useCallback(() => {
    window.location.assign(`mailto:${getSupportEmail()}`);
  }, []);

  return (
    <button
      {...buttonProps}
      type="button"
      aria-label="Email BetaManuscript support"
      onClick={handleClick}
      className={`inline appearance-none border-0 bg-transparent p-0 text-left font-inherit text-inherit ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
