import { MONO } from "../../../shared/config/design-tokens";
import { TAGS } from "../data/mockup-data";
import type { TagKey } from "../types";

// ─── Tag badge ────────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: TagKey }) {
  const t = TAGS[tag];
  return (
    <span
      className="inline-flex items-center text-[9px] px-1.5 py-0.5 uppercase tracking-wide"
      style={{ background: t.bg, color: t.color, fontFamily: MONO, border: `1px solid ${t.color}30` }}
    >
      {t.label}
    </span>
  );
}



export { TagBadge };
