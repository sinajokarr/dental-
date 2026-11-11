// Renders both hero posters from the live 3D scene (3D_HERO_MASTER_PLAN §3, D-065):
//   tooth-scan.png   — first frame of the digital-scan entrance (shown before the 3D takes over)
//   tooth-poster.png — the finished porcelain tooth (reduced motion, no WebGL, 3D failure)
// Needs the dev server: npm run dev   then, from frontend/:   node scripts/render-poster.mjs
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
mkdirSync("public/images/hero", { recursive: true });
for (const [state, file] of [["scan", "tooth-scan.png"], ["final", "tooth-poster.png"]]) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:3000/en?poster=${state}`);
  await page.waitForSelector("html[data-poster-ready]", { timeout: 60_000 });
  // Element screenshots include whatever overlaps the canvas: hide the header and the Next.js dev overlay.
  await page.addStyleTag({ content: "header, nextjs-portal { display: none !important; }" });
  await page.locator("canvas").screenshot({ path: `public/images/hero/${file}` });
  await page.close();
  console.log(`public/images/hero/${file} written`);
}
await browser.close();
