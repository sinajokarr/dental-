// Renders the hero poster from the live 3D scene, so the poster equals the first 3D frame (3D_HERO_MASTER_PLAN §3).
// Needs the dev server: npm run dev   then, from frontend/:   node scripts/render-poster.mjs
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/en?poster");
await page.waitForSelector("html[data-poster-ready]", { timeout: 60_000 });
// Element screenshots include whatever overlaps the canvas: hide the header and the Next.js dev overlay.
await page.addStyleTag({ content: "header, nextjs-portal { display: none !important; }" });
mkdirSync("public/images/hero", { recursive: true });
await page.locator("canvas").screenshot({ path: "public/images/hero/tooth-poster.png" });
await browser.close();
console.log("public/images/hero/tooth-poster.png written");
