// Studio stage: one renderer, a soft room environment, a warm key light and a cool fill. Layers are rendered one by one
// with every other part as a depth-only occluder, so each PNG holds exactly the pixels that part contributes and the
// stack composes correctly in the browser (D-081).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { JOBS } from "/jobs.js";

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
    } else mesh = new THREE.Mesh(def.geometry, def.material);
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
  const job = JOBS[jobName];
  const size = job.size ?? 2000;
  renderer.setSize(size, size, false);
  const { scene, parts } = buildScene(job, assets);
  const camera = new THREE.PerspectiveCamera(job.fov ?? 20, 1, 1, 400);
  job.camera(camera, THREE);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const out = { layers: {}, meta: {} };
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
window.__ready = true;
