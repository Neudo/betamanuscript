import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

import { MONO, MUTED, PAPER, SANS, SERIF } from "@/shared/config/design-tokens";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "display" | "section" | "page" | "card" | "workspace" | "subsection" | "small" | "label";
type HeadingTone = "default" | "inverse" | "muted";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  level: HeadingLevel;
  size?: HeadingSize;
  tone?: HeadingTone;
};

const headingTags: Record<HeadingLevel, "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};

const defaultSizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: "display",
  2: "section",
  3: "card",
  4: "subsection",
  5: "small",
  6: "label",
};

const headingStyles: Record<HeadingSize, CSSProperties> = {
  display: {
    fontFamily: SERIF,
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: 400,
    letterSpacing: "-0.025em",
    lineHeight: 1.05,
  },
  section: {
    fontFamily: SERIF,
    fontSize: "clamp(2rem, 3.4vw, 3rem)",
    fontWeight: 400,
    letterSpacing: "-0.022em",
    lineHeight: 1.08,
  },
  page: {
    fontFamily: SERIF,
    fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)",
    fontWeight: 400,
    letterSpacing: "-0.018em",
    lineHeight: 1.1,
  },
  card: {
    fontFamily: SERIF,
    fontSize: "clamp(1.25rem, 1.9vw, 1.55rem)",
    fontWeight: 500,
    letterSpacing: "-0.012em",
    lineHeight: 1.15,
  },
  workspace: {
    fontFamily: SANS,
    fontSize: "1.75rem",
    fontWeight: 500,
    letterSpacing: "normal",
    lineHeight: 1.2,
  },
  subsection: {
    fontFamily: SANS,
    fontSize: "1.125rem",
    fontWeight: 500,
    lineHeight: 1.3,
  },
  small: {
    fontFamily: SANS,
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.35,
  },
  label: {
    fontFamily: MONO,
    fontSize: "0.625rem",
    fontWeight: 400,
    letterSpacing: "0.18em",
    lineHeight: 1.3,
    textTransform: "uppercase",
  },
};

const headingTones: Record<HeadingTone, CSSProperties> = {
  default: {},
  inverse: { color: PAPER },
  muted: { color: MUTED },
};

export function Heading({ children, level, size, style, tone = "default", ...props }: HeadingProps) {
  const Tag = headingTags[level];
  const resolvedSize = size ?? defaultSizeByLevel[level];

  return (
    <Tag {...props} style={{ ...headingStyles[resolvedSize], ...headingTones[tone], ...style }}>
      {children}
    </Tag>
  );
}
