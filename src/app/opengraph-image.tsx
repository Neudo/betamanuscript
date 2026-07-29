import { ImageResponse } from "next/og";

export const alt = "BetaManuscript — beta reader feedback workspace";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f5f0e8",
          color: "#1c1812",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "76px 84px",
          width: "100%",
        }}
      >
        <div style={{ color: "#7b1d1d", display: "flex", fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
          BetaManuscript
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 920 }}>
          <div style={{ fontFamily: "serif", fontSize: 76, letterSpacing: -3, lineHeight: 1.05 }}>
            Turn beta reader feedback into clearer revisions.
          </div>
          <div style={{ color: "#5d554a", display: "flex", fontSize: 28, lineHeight: 1.4 }}>
            Structured annotations for authors who want to understand what readers noticed.
          </div>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
          <div style={{ background: "#7b1d1d", height: 10, width: 64 }} />
          <div style={{ color: "#5d554a", display: "flex", fontSize: 22 }}>BETAMANUSCRIPT.COM</div>
        </div>
      </div>
    ),
    size,
  );
}
