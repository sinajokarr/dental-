// Cuts, crops, scales and re-encodes a licensed source clip for the site (D-084), with the system's Google Chrome:
// the clip plays into a canvas (crop + scale + a light grade) and MediaRecorder writes WebM (VP9) and MP4 (H.264).
// Also exports the first and the last frame as PNG (posters). No ffmpeg on this machine; nothing is installed.
//   node scripts/video/encode.mjs <source.mp4> <out-basename> '<json options>'
//   options: { start, end, crop: [x, y, w, h] (source px, after rotation), size: [w, h], kbps, filter, rotate: 0 | 90 | -90 | 180 }
import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const [source, out, json] = process.argv.slice(2);
const o = { start: 0, kbps: 900, filter: "none", ...JSON.parse(json) };
const server = http.createServer((req, res) => {
  if (req.url === "/") return res.writeHead(200, { "content-type": "text/html" }).end("<!doctype html><body>");
  const size = fs.statSync(source).size, range = req.headers.range;
  const [s, e] = range ? range.replace("bytes=", "").split("-") : ["0", ""];
  const start = Number(s), end = e ? Number(e) : size - 1;
  res.writeHead(range ? 206 : 200, { "content-type": "video/mp4", "accept-ranges": "bytes", "content-length": end - start + 1, ...(range && { "content-range": `bytes ${start}-${end}/${size}` }) });
  fs.createReadStream(source, { start, end }).pipe(res);
}).listen(0);
(async () => {
  const browser = await chromium.launch({ channel: "chrome", args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("  [page]", m.text()));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const result = await page.evaluate(async (o) => {
    const video = document.createElement("video");
    video.muted = true; video.preload = "auto"; video.src = "/clip.mp4";
    await new Promise((ok, no) => { video.oncanplaythrough = ok; video.onerror = () => no(new Error("cannot decode")); });
    const [W, H] = o.size, [cx, cy, cw, ch] = o.crop;
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d"); ctx.filter = o.filter; ctx.imageSmoothingQuality = "high";
    // Phone footage often arrives sideways: rotate into an intermediate canvas first, then crop from it.
    let source = video;
    if (o.rotate) {
      const turned = document.createElement("canvas");
      const half = o.rotate === 180;
      turned.width = half ? video.videoWidth : video.videoHeight; turned.height = half ? video.videoHeight : video.videoWidth;
      const t = turned.getContext("2d");
      if (half) { t.translate(video.videoWidth, video.videoHeight); t.rotate(Math.PI); }
      else if (o.rotate === -90) { t.translate(0, video.videoWidth); t.rotate(-Math.PI / 2); } else { t.translate(video.videoHeight, 0); t.rotate(Math.PI / 2); }
      source = turned;
      source.paint = () => t.drawImage(video, 0, 0);
    }
    const draw = () => { source.paint?.(); ctx.drawImage(source, cx, cy, cw, ch, 0, 0, W, H); };
    const seek = (t) => new Promise((ok) => { video.onseeked = ok; video.currentTime = t; });
    const b64 = async (blob) => { const bytes = new Uint8Array(await blob.arrayBuffer()); let s = ""; for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768)); return btoa(s); };
    const png = async () => b64(await new Promise((ok) => canvas.toBlob(ok, "image/png")));
    const out = { files: {} };
    await seek(o.end); draw(); out.files["last.png"] = await png();
    await seek(o.start); draw(); out.files["first.png"] = await png();
    for (const [ext, mime] of [["webm", "video/webm;codecs=vp9"], ["mp4", "video/mp4;codecs=avc1.640028"]]) {
      if (!MediaRecorder.isTypeSupported(mime)) { console.log("not supported: " + mime); continue; }
      await seek(o.start); draw();
      const recorder = new MediaRecorder(canvas.captureStream(), { mimeType: mime, videoBitsPerSecond: o.kbps * 1000 });
      const chunks = []; recorder.ondataavailable = (e) => chunks.push(e.data);
      const done = new Promise((ok) => (recorder.onstop = ok));
      const frame = () => { draw(); if (video.currentTime >= o.end || video.ended) { video.pause(); if (recorder.state === "recording") recorder.stop(); } else video.requestVideoFrameCallback(frame); };
      video.onended = () => recorder.state === "recording" && recorder.stop(); // the last frame may never reach `end`
      recorder.start(); video.requestVideoFrameCallback(frame); await video.play(); await done;
      out.files[ext] = await b64(new Blob(chunks, { type: mime }));
    }
    return out;
  }, o);
  for (const [name, data] of Object.entries(result.files)) {
    const file = name.includes(".") ? `${out}-${name}` : `${out}.${name}`;
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    console.log(path.basename(file), (fs.statSync(file).size / 1024).toFixed(0) + " KB");
  }
  await browser.close(); server.close();
})();
