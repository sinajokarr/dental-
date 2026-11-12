import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share image for every page: the brand and the porcelain tooth (Latin text only, so one image serves all locales).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "JOKAR DENTAL — Antalya & Istanbul";

export default async function OpenGraphImage() {
  const tooth = await readFile(join(process.cwd(), "public/images/hero/tooth-poster.png"));
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "space-between", padding: "0 80px 0 110px", background: "#f3eeea" }}>
      <div style={{ display: "flex", flexDirection: "column", color: "#263242" }}>
        <div style={{ fontSize: 92, letterSpacing: 10, fontWeight: 600 }}>JOKAR</div>
        <div style={{ fontSize: 30, letterSpacing: 22, marginTop: 4 }}>DENTAL</div>
        <div style={{ fontSize: 30, color: "#536277", marginTop: 48 }}>Antalya · Istanbul</div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- rendered to PNG by ImageResponse */}
      <img src={`data:image/png;base64,${tooth.toString("base64")}`} width={560} height={560} />
    </div>,
    size,
  );
}
