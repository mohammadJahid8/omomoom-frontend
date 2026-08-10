import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} · ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fdfbf7",
        padding: "72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: "#1a1a1a" }}>
          {siteConfig.name}
        </span>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#e8336b",
            marginLeft: 6,
            marginTop: 14,
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#e8336b",
          }}
        >
          The Omomoom Filter
        </span>
        <span
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: "#1a1a1a",
            lineHeight: 1.05,
            marginTop: 20,
          }}
        >
          Find your next bite.
        </span>
        <span
          style={{
            fontSize: 28,
            color: "#6f6862",
            marginTop: 24,
            maxWidth: 900,
          }}
        >
          The most powerful restaurant filter in Miami. By cuisine, neighborhood,
          price, dish, occasion and dietary needs.
        </span>
      </div>

      <div style={{ display: "flex", height: 8, width: "100%" }}>
        <div style={{ flex: 1, background: "#e8336b" }} />
        <div style={{ flex: 1, background: "#a23b2e" }} />
        <div style={{ flex: 1, background: "#1a1a1a" }} />
      </div>
    </div>,
    size,
  );
}
