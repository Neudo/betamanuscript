// ─── Design tokens ────────────────────────────────────────────────────────────

const INK = "hsl(var(--ink))";
const PAPER = "hsl(var(--paper))";
const CARD = "hsl(var(--card))";
const WARM = "hsl(var(--warm))";
const OXBLOOD = "hsl(var(--oxblood))";
const OXBLOOD_TEXT = "hsl(var(--oxblood-text))";
const FOREST = "hsl(var(--forest))";
const MUTED = "hsl(var(--muted-foreground))";
const BODY = "hsl(var(--body))";
const INVERSE_BACKGROUND = "hsl(var(--inverse-background))";
const INVERSE_FOREGROUND = "hsl(var(--inverse-foreground))";
const INVERSE_MUTED = "hsl(var(--inverse-muted))";
const MONO = "'DM Mono', monospace";
const SERIF = "'EB Garamond', serif";
const SANS = "'Inter', sans-serif";
const premiumEase = [0.22, 1, 0.36, 1] as const;


export {
  INK,
  PAPER,
  CARD,
  WARM,
  OXBLOOD,
  OXBLOOD_TEXT,
  FOREST,
  MUTED,
  BODY,
  INVERSE_BACKGROUND,
  INVERSE_FOREGROUND,
  INVERSE_MUTED,
  MONO,
  SERIF,
  SANS,
  premiumEase,
};
