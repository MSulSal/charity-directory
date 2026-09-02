import { ImageResponse } from "next/og";

export const alt = "Charity Directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0d0a12",
          color: "#f5f1eb",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "84px",
          width: "100%",
        }}
      >
        <div style={{ color: "#e8be4b", fontSize: 28, letterSpacing: 8, textTransform: "uppercase" }}>
          Charity Directory
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.08, marginTop: 34, textAlign: "center" }}>
          Find charities by cause, location, and ways to help.
        </div>
        <div style={{ color: "#c8bdd6", fontSize: 30, marginTop: 38, textAlign: "center" }}>
          Source-linked organization profiles and local resource discovery.
        </div>
      </div>
    ),
    { ...size },
  );
}
