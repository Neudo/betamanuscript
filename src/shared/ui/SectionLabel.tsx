import { ReactNode } from "react";
import { MONO, MUTED } from "../config/design-tokens";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="h-px w-6" style={{ background: "rgba(28,24,18,0.2)" }} />
      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTED, fontFamily: MONO }}>
        {children}
      </span>
    </div>
  );
}



export { SectionLabel };
