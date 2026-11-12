import { ImageResponse } from "next/og";

// Home-screen icon: the favicon's tooth on brand navy.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#263242" }}>
      <svg width="120" height="120" viewBox="0 0 24 24">
        <path fill="#ffffff" d="M7 3c-2.2 0-4 1.8-4 4.2 0 2.1.7 3.5 1.4 5.3.6 1.6.8 3.5 1.3 5.5.4 1.7 1 3 2 3 1.3 0 1.6-1.6 1.9-3.3.3-1.6.6-3 1.4-3s1.1 1.4 1.4 3c.3 1.7.6 3.3 1.9 3.3 1 0 1.6-1.3 2-3 .5-2 .7-3.9 1.3-5.5.7-1.8 1.4-3.2 1.4-5.3C21 4.8 19.2 3 17 3c-1.9 0-3 1.2-5 1.2S8.9 3 7 3Z" />
      </svg>
    </div>,
    size,
  );
}
