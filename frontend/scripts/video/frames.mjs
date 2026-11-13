// usage: node scripts/video/frames.mjs <dir> <outdir> id1 id2 ...   — contact sheet of 8 frames per clip, via system Chrome (H.264)
import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const [dir, out, ...ids] = process.argv.slice(2);
const server = http.createServer((req, res) => {
  const f = path.join(dir, path.basename(req.url.split("?")[0]));
  if (!fs.existsSync(f)) return res.writeHead(404).end();
  const size = fs.statSync(f).size, range = req.headers.range;
  if (range) { const [s, e] = range.replace("bytes=", "").split("-"); const start = Number(s), end = e ? Number(e) : size - 1;
    res.writeHead(206, { "content-type": "video/mp4", "content-range": `bytes ${start}-${end}/${size}`, "accept-ranges": "bytes", "content-length": end - start + 1 });
    fs.createReadStream(f, { start, end }).pipe(res);
  } else { res.writeHead(200, { "content-type": f.endsWith(".mp4") ? "video/mp4" : "text/html", "content-length": size, "accept-ranges": "bytes" }); fs.createReadStream(f).pipe(res); }
}).listen(0);
(async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  fs.writeFileSync(path.join(dir, "blank.html"), "<!doctype html><body>");
  const b = await chromium.launch({ channel: "chrome" });
  const p = await b.newPage();
  await p.goto(base + "/blank.html?n=" + (process.env.N || 8));
  for (const id of ids) {
    const r = await p.evaluate(async (src) => {
      const v = document.createElement("video"); v.muted = true; v.src = src; v.preload = "auto";
      await new Promise((ok, no) => { v.onloadedmetadata = ok; v.onerror = () => no(new Error("decode")); });
      const N = +(new URLSearchParams(location.search).get("n") || 8), w = 320, h = Math.round((320 * v.videoHeight) / v.videoWidth);
      const c = document.createElement("canvas"); c.width = w * 4; c.height = h * Math.ceil(N / 4); const x = c.getContext("2d");
      for (let i = 0; i < N; i++) { v.currentTime = (v.duration * (i + 0.5)) / N; await new Promise((ok) => (v.onseeked = ok)); x.drawImage(v, (i % 4) * w, Math.floor(i / 4) * h, w, h); }
      return { d: v.duration, w: v.videoWidth, h: v.videoHeight, png: c.toDataURL("image/jpeg", 0.8) };
    }, `${base}/${id}.mp4`).catch((e) => ({ err: String(e) }));
    if (r.err) { console.log(id, r.err); continue; }
    fs.writeFileSync(path.join(out, `${id}.jpg`), Buffer.from(r.png.split(",")[1], "base64"));
    console.log(id, r.d.toFixed(1) + "s", r.w + "x" + r.h);
  }
  await b.close(); server.close();
})();
