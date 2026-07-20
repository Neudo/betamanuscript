import { ReactNode } from "react";
import { MONO } from "../../../shared/config/design-tokens";
import { TAGS } from "../data/mockup-data";
import type { TagKey } from "../types";

// ─── Inline annotation span ───────────────────────────────────────────────────

function AnnotationMarker({
  tag, count, children, active, onClick,
}: {
  tag: TagKey; count: number; children: ReactNode;
  active: boolean; onClick: () => void;
}) {
  const t = TAGS[tag];
  return (
    <span
      onClick={onClick}
      className="cursor-pointer relative inline"
      style={{
        background: active ? t.bg.replace("0.11", "0.22").replace("0.12", "0.24").replace("0.1", "0.2") : t.bg,
        borderBottom: `1.5px solid ${t.color}`,
        padding: "0 2px",
        transition: "background 0.15s",
      }}
    >
      {children}
      <span
        className="ml-1 text-[9px] align-super"
        style={{ fontFamily: MONO, color: t.color, opacity: 0.8 }}
      >
        {count}
      </span>
    </span>
  );
}



export { AnnotationMarker };
