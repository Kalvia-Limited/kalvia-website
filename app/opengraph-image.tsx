import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const alt = "Kalvia — practical skills, real careers, enabling prosperity.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function SocialImage() {
  const mark = await readFile(join(process.cwd(), "public/assets/favicon.svg"));
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#170C79", color: "white", padding: "60px 72px", position: "relative" }}>
    <div style={{ position: "absolute", right: -65, bottom: -160, width: 470, height: 620, borderRadius: "240px 240px 0 0", background: "#FF5A00", opacity: .8 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* ImageResponse renders this local SVG into the PNG; no remote image request. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/svg+xml;base64,${mark.toString("base64")}`} width={76} height={76} alt="" />
      <span style={{ fontSize: 52, fontWeight: 700 }}>Kalvia</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", maxWidth: 900, gap: 16 }}><div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.08 }}><span>Practical skills.</span><span>Real careers.</span></div><div style={{ fontSize: 36, color: "#FFAE00" }}>Enabling prosperity.</div></div>
    <div style={{ display: "flex", fontSize: 24 }}>Academy · Marketplace · SOAT</div>
  </div>, size);
}
