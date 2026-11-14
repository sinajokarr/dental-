// Studio stage: one renderer, a soft room environment, a warm key light and a cool fill. Layers are rendered one by one
// with every other part as a depth-only occluder, so each PNG holds exactly the pixels that part contributes and the
// stack composes correctly in the browser (D-081).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { JOBS } from "/jobs.js";
import { V7_FILMS, V7_JOBS } from "/jobs-v7.js";

const canvas = document.createElement("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;
renderer.setClearColor(0x000000, 0);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;

function buildScene(job, assets) {
  const scene = new THREE.Scene();
  scene.environment = environment;
  scene.environmentIntensity = job.envIntensity ?? 0.9;
  const key = new THREE.DirectionalLight(0xfff1e0, job.key ?? 2.4);
  key.position.set(-9, 14, 12);
  const fill = new THREE.DirectionalLight(0xdfe8f5, job.fill ?? 0.55);
  fill.position.set(10, 3, 8);
  const rim = new THREE.DirectionalLight(0xfff6ea, job.rim ?? 0.9);
  rim.position.set(2, 6, -12);
  scene.add(key, fill, rim);
  const parts = {};
  for (const [id, def] of Object.entries(job.parts(assets, THREE))) {
    let mesh;
    if (Array.isArray(def.geometry)) {
      mesh = new THREE.Group();
      for (const g of def.geometry) mesh.add(new THREE.Mesh(g, def.material));
    } else mesh = def.points ? new THREE.Points(def.geometry, def.material) : new THREE.Mesh(def.geometry, def.material);
    def.place?.(mesh);
    const wrap = def.group?.(mesh);
    if (wrap) {
      wrap.add(mesh);
      parts[id] = wrap;
      scene.add(wrap);
    } else {
      parts[id] = mesh;
      scene.add(mesh);
    }
  }
  return { scene, parts };
}

window.__run = async (jobName, assets) => {
  const job = JOBS[jobName] ?? V7_JOBS[jobName];
  const size = job.size ?? 2000;
  renderer.setSize(size, size, false);
  const { scene, parts } = buildScene(job, assets);
  const camera = new THREE.PerspectiveCamera(job.fov ?? 20, 1, 1, 400);
  job.camera(camera, THREE);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const out = { layers: {}, meta: {}, out: job.out ?? 1000 };
  for (const layer of job.layers) {
    for (const [id, mesh] of Object.entries(parts)) {
      const shows = layer.show.includes("*") || layer.show.includes(id);
      mesh.visible = shows || layer.occlude?.includes(id) || false;
      mesh.traverse((node) => {
        if (!node.material) return;
        for (const m of Array.isArray(node.material) ? node.material : [node.material]) m.colorWrite = shows;
      });
    }
    renderer.clear();
    renderer.render(scene, camera);
    out.layers[layer.name] = canvas.toDataURL("image/png");
  }
  if (job.meta) out.meta = job.meta(parts, camera, THREE, size);
  return out;
};
// Films (D-092): a job animated over t ∈ [0, 1] is rendered frame by frame and recorded at a steady frame rate. Rendering
// is slower than real time, so the recorders are paused while a frame renders and resumed only to take it.
window.__film = async (name, assets, { fps = 30, seconds = 8, sizes = [720, 480], kbps = [1000, 420] }) => {
  const job = V7_FILMS[name];
  const size = job.size ?? 1080;
  renderer.setSize(size, size, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const { scene, parts } = buildScene(job, assets);
  const camera = new THREE.PerspectiveCamera(job.fov ?? 20, 1, 1, 600);
  job.setup?.(scene, parts, THREE, camera);
  const outs = sizes.map((s, i) => {
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    const stream = c.captureStream(0);
    const track = stream.getVideoTracks()[0];
    const recs = ["video/webm;codecs=vp9", "video/mp4;codecs=avc1.42E01F"].filter((m) => MediaRecorder.isTypeSupported(m)).map((mime) => {
      const r = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: kbps[i] * 1000 });
      const chunks = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.start();
      r.pause();
      return { mime, r, chunks };
    });
    return { s, c, ctx, track, recs };
  });
  const frames = Math.round(fps * seconds);
  let last = "";
  for (let i = 0; i < frames; i++) {
    job.animate(i / (frames - 1), parts, camera, THREE);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    for (const o of outs) {
      o.ctx.drawImage(canvas, 0, 0, o.s, o.s);
      for (const { r } of o.recs) r.resume();
      o.track.requestFrame();
    }
    await new Promise((ok) => setTimeout(ok, 1000 / fps));
    for (const o of outs) for (const { r } of o.recs) r.pause();
    if (i === frames - 1) last = canvas.toDataURL("image/png");
  }
  const result = { last, videos: {} };
  for (const o of outs)
    for (const { mime, r, chunks } of o.recs) {
      r.resume();
      await new Promise((ok) => { r.onstop = ok; r.stop(); });
      const blob = new Blob(chunks, { type: mime });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
      result.videos[`${o.s}.${mime.includes("mp4") ? "mp4" : "webm"}`] = btoa(bin);
    }
  return result;
};
window.__ready = true;
