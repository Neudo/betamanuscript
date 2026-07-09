import { BookOpen } from "lucide-react";
import {
  INK,
  MONO,
  MUTED,
  OXBLOOD,
  PAPER,
  SERIF,
} from "../../../shared/config/design-tokens";

export function Footer() {
  return (
    <footer
      className="relative z-10 border-t px-6 md:px-12 py-8"
      style={{ borderColor: "rgba(28,24,18,0.1)", background: PAPER }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen size={14} strokeWidth={1.5} style={{ color: OXBLOOD }} />
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: SERIF, color: INK }}
          >
            BetaQuill
          </span>
        </div>
        <div className="text-[11px]" style={{ fontFamily: MONO, color: MUTED }}>
          A workspace for authors who take revision seriously.
        </div>
        <div className="text-[10px]" style={{ fontFamily: MONO, color: "#C8C2B6" }}>
          © 2026 - BetaQuill
        </div>
      </div>
    </footer>
  );
}
