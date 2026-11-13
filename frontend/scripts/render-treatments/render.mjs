// Renders the treatment layers (D-081):   node scripts/render-treatments/render.mjs [implant|veneers|smile ...]
// Serves this folder and node_modules/three, drives headless Chromium (software WebGL), exports transparent PNG layers
// to src/assets/treatments/<job>/<layer>.png at 1000 px. The studio render is deterministic: same code, same pixels.
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { decodeTooth } from "../../src/components/three/hero-tooth/toothFormat.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = join(here, "..", "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json" };
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://x").pathname;
  const file = url.startsWith("/three/") ? join(root, "node_modules", "three", url.slice(7)) : join(here, url === "/" ? "index.html" : url);
  try {
    if (!normalize(file).startsWith(root)) throw new Error("outside");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

// The molar crown comes from the project's own model (public/models/tooth.bin): decode it to plain world-space arrays.
const mesh = decodeTooth(readFileSync(join(root, "public/models/tooth.bin")).buffer.slice(0));
const world = (v, a) => mesh.min[a] + ((mesh.positions[v * 3 + a] / 32767 + 1) / 2) * (mesh.max[a] - mesh.min[a]);
const count = mesh.positions.length / 3;
const positions = new Float32Array(count * 3);
for (let v = 0; v < count; v++) for (let a = 0; a < 3; a++) positions[v * 3 + a] = world(v, a);
const tooth = { positions: Array.from(positions), normals: Array.from(mesh.normals).map((n) => n / 127), indices: Array.from(mesh.indices) };

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : ["implant", "veneers", "smile"];
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("console", (m) => ["error", "warning"].includes(m.type()) && console.log("  [page]", m.text().slice(0, 200)));
page.on("pageerror", (e) => console.log("  [pageerror]", String(e).slice(0, 300)));
await page.goto(base);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60_000 });
for (const job of wanted) {
  const started = Date.now();
  const result = await page.evaluate(([name, assets]) => window.__run(name, assets), [job, { tooth }]);
  const dir = join(root, "src", "assets", "treatments", job);
  mkdirSync(dir, { recursive: true });
  for (const [layer, dataUrl] of Object.entries(result.layers)) {
    const png = Buffer.from(dataUrl.split(",")[1], "base64");
    await sharp(png).resize(1000, 1000, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(join(dir, `${layer}.png`));
  }
  if (Object.keys(result.meta).length) writeFileSync(join(dir, "meta.json"), JSON.stringify(result.meta, null, 1));
  console.log(`${job}: ${Object.keys(result.layers).join(", ")} in ${((Date.now() - started) / 1000).toFixed(1)} s`);
}
await browser.close();
server.close();
