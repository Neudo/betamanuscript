"use client";

import { useState } from "react";
import { BODY, INK, MONO, MUTED, PAPER, SERIF, SANS } from "../../../shared/config/design-tokens";
import { annotations, TAGS } from "../data/mockup-data";
import type { TagKey } from "../types";
import { AnnotationMarker } from "./AnnotationMarker";
import { TagBadge } from "./TagBadge";

// ─── Reader mockup panel ──────────────────────────────────────────────────────

function ReaderPanel() {
  const [activeId, setActiveId] = useState<string | null>("a2");
  const active = annotations.find((a) => a.id === activeId) ?? null;

  const ann = (id: string) => {
    const a = annotations.find((x) => x.id === id)!;
    return (
      <AnnotationMarker tag={a.tag} count={a.comments.length} active={activeId === id} onClick={() => setActiveId(activeId === id ? null : id)}>
        {a.phrase}
      </AnnotationMarker>
    );
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr", minHeight: "380px" }}>
      <div className="grid md:grid-cols-[1fr_260px]" style={{ minHeight: "380px" }}>
        {/* Manuscript text */}
        <div className="p-6 overflow-y-auto" style={{ borderRight: "1px solid rgba(28,24,18,0.08)" }}>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[9px] uppercase tracking-widest" style={{ fontFamily: MONO, color: MUTED }}>Chapter 3</span>
            <div className="h-px flex-1" style={{ background: "rgba(28,24,18,0.1)" }} />
            <div className="flex gap-1.5">
              {(Object.keys(TAGS) as TagKey[]).map((k) => (
                <TagBadge key={k} tag={k} />
              ))}
            </div>
          </div>
          <div
            className="leading-[1.85] text-[13px]"
            style={{ fontFamily: SERIF, color: INK, fontSize: "0.95rem" }}
          >
            <p className="mb-4">
              The cartographer spread his maps across the table,{" "}
              {ann("a1")}. He had spent thirty years drawing borders
              that never existed and coastlines that had shifted since the surveys were done.
              The guild had never asked him to be accurate. They had asked him to be useful.
            </p>
            <p className="mb-4">
              &ldquo;I mapped the world as it should be,&rdquo;{" "}
              {ann("a2")}
              , carrying the weight of careful deception. &ldquo;What you do with those maps
              is your own affair.&rdquo;
            </p>
            <p className="mb-4">
              {ann("a3")} enough when the guild first approached him — a coastal survey,
              they had said, nothing more. Now, surrounded by their silence and the smell
              of old parchment, he felt the familiar vertigo of a man standing at the edge
              of an unmapped place.
            </p>
            <p>
              He looked up from the table and{" "}
              {ann("a4")} — had known, perhaps, before he had walked
              through the door. The silence was not hostile. It was expectant.
            </p>
          </div>
        </div>

        {/* Annotation panel */}
        <div className="p-4" style={{ background: "rgba(245,240,232,0.4)" }}>
          {active ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TagBadge tag={active.tag} />
                <span className="text-[9px]" style={{ fontFamily: MONO, color: MUTED }}>
                  {active.comments.length} readers
                </span>
              </div>
              <p
                className="text-[11px] italic mb-4 pb-3"
                style={{ fontFamily: SERIF, color: BODY, borderBottom: "1px solid rgba(28,24,18,0.1)" }}
              >
                &ldquo;{active.phrase}&rdquo;
              </p>
              <div className="space-y-3">
                {active.comments.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold"
                        style={{ background: INK, color: PAPER }}
                      >
                        {c.reader[0]}
                      </div>
                      <span className="text-[10px] font-medium" style={{ fontFamily: SANS, color: INK }}>
                        {c.reader}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed pl-5" style={{ fontFamily: SERIF, color: BODY }}>
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full pt-12 text-center">
              <span className="text-[11px] italic" style={{ fontFamily: SERIF, color: MUTED }}>
                Click a highlighted passage to see what readers said.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



export { ReaderPanel };
