// Records the V7 films (D-092):   node scripts/render-treatments/film.mjs <film> [seconds]
// Same studio as render.mjs, in the system's Google Chrome (H.264 needs it): every frame is rendered, then recorded at a
// steady 30 fps into WebM (VP9) and MP4 (H.264), 720 and 480 px, plus the last frame as a WebP poster, into
// public/images/treatments/<film>-*. Films are square and silent; the page plays them once (FilmOnView, D-086).
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
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
    const body = readFileSync(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);

const mesh = decodeTooth(readFileSync(join(root, "public/models/tooth.bin")).buffer.slice(0));
const world = (v, a) => mesh.min[a] + ((mesh.positions[v * 3 + a] / 32767 + 1) / 2) * (mesh.max[a] - mesh.min[a]);
const count = mesh.positions.length / 3;
const positions = [];
for (let v = 0; v < count; v++) for (let a = 0; a < 3; a++) positions.push(world(v, a));
const tooth = { positions, normals: Array.from(mesh.normals).map((n) => n / 127), indices: Array.from(mesh.indices) };

const [name, seconds = "8"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
const page = await browser.newPage();
page.on("console", (m) => ["error", "warning"].includes(m.type()) && !m.text().includes("GPU stall") && console.log("  [page]", m.text().slice(0, 200)));
page.on("pageerror", (e) => console.log("  [pageerror]", String(e).slice(0, 300)));
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60_000 });
const started = Date.now();
const result = await page.evaluate(([n, assets, s]) => window.__film(n, assets, { seconds: s }), [name, { tooth }, Number(seconds)]);
const out = join(root, "public", "images", "treatments");
for (const [file, b64] of Object.entries(result.videos)) {
  writeFileSync(join(out, `${name}-${file}`), Buffer.from(b64, "base64"));
  console.log(`${name}-${file}`, Math.round(Buffer.from(b64, "base64").length / 1024), "KB");
}
await sharp(Buffer.from(result.last.split(",")[1], "base64")).resize(720, 720).webp({ quality: 80 }).toFile(join(out, `${name}-last.webp`));
console.log(`${name}: ${((Date.now() - started) / 1000).toFixed(1)} s`);
await browser.close();
server.close();
