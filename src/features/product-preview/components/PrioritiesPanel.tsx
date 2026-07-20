import { BODY, CARD, FOREST, INK, MONO, MUTED, OXBLOOD, PAPER, SERIF, SANS } from "../../../shared/config/design-tokens";
import { attentionItems, readerProgress, repeatedAnnotationIssues, strongestMoments, TAGS } from "../data/mockup-data";
import { TagBadge } from "./TagBadge";

// ─── Dashboard / priorities panel ─────────────────────────────────────────────

function PrioritiesPanel() {
  const maxCount = Math.max(...repeatedAnnotationIssues.map((r) => r.count));
  return (
    <div className="p-5 grid md:grid-cols-2 gap-5" style={{ minHeight: "380px" }}>
      {/* Repeated issues */}
      <div className="p-4 border" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
        <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
          Annotation frequency
        </div>
        <div className="space-y-2.5">
          {repeatedAnnotationIssues.map((r) => (
            <div key={r.tag}>
              <div className="flex items-center justify-between mb-1">
                <TagBadge tag={r.tag} />
                <span className="text-[9px]" style={{ fontFamily: MONO, color: MUTED }}>
                  {r.count} notes · {r.chapters}
                </span>
              </div>
              <div className="h-1" style={{ background: "rgba(28,24,18,0.08)" }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(r.count / maxCount) * 100}%`,
                    background: TAGS[r.tag].bar,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strongest moments */}
      <div className="p-4 border" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
        <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
          Strongest moments
        </div>
        <div className="space-y-3 mb-5">
          {strongestMoments.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <span className="text-[9px] mr-2" style={{ fontFamily: MONO, color: MUTED }}>{s.chapter}</span>
                <span className="text-[11px]" style={{ fontFamily: SERIF, color: INK }}>{s.scene}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-1.5 h-1.5"
                    style={{ background: j < s.score ? FOREST : "rgba(28,24,18,0.1)" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] uppercase tracking-widest mb-2.5" style={{ fontFamily: MONO, color: MUTED }}>
          Needs attention
        </div>
        <div className="space-y-2">
          {attentionItems.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[9px] mt-0.5 flex-shrink-0" style={{ fontFamily: MONO, color: OXBLOOD }}>{a.chapter}</span>
              <span className="text-[10px] leading-snug" style={{ color: BODY }}>{a.issue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reader progress — full width */}
      <div className="md:col-span-2 p-4 border" style={{ borderColor: "rgba(28,24,18,0.1)", background: CARD }}>
        <div className="text-[9px] uppercase tracking-widest mb-3" style={{ fontFamily: MONO, color: MUTED }}>
          Reader progress
        </div>
        <div className="grid sm:grid-cols-5 gap-4">
          {readerProgress.map((r) => (
            <div key={r.name}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
                  style={{
                    background: r.status === "finished" ? FOREST : r.status === "inactive" ? "rgba(28,24,18,0.2)" : OXBLOOD,
                    color: PAPER,
                  }}
                >
                  {r.avatar}
                </div>
                <span className="text-[10px] font-medium" style={{ fontFamily: SANS, color: INK }}>{r.name}</span>
              </div>
              <div className="h-1 mb-1" style={{ background: "rgba(28,24,18,0.08)" }}>
                <div
                  className="h-full"
                  style={{
                    width: `${(r.chapter / r.total) * 100}%`,
                    background: r.status === "finished" ? FOREST : r.status === "inactive" ? "rgba(28,24,18,0.25)" : OXBLOOD,
                  }}
                />
              </div>
              <span
                className="text-[9px]"
                style={{ fontFamily: MONO, color: MUTED }}
              >
                {r.status === "finished" ? "finished" : `ch ${r.chapter}/${r.total}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



export { PrioritiesPanel };
