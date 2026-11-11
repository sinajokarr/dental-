// Generates public/models/tooth.bin — the interim procedural molar for the hero (D-061; DP1 purchase pending).
// Signed distance field (crown + cusps + fossa + two roots, smooth-unioned) → marching cubes → merged, quantized.
// Run from frontend/:  node scripts/build-tooth.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";
import { BufferAttribute, BufferGeometry, MeshBasicMaterial } from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { encodeTooth } from "../src/components/three/hero-tooth/toothFormat.ts";

const RES = 72; // marching-cubes grid (keeps the mesh under the 30k-triangle budget)
const HALF = 1.55; // world half-extent mapped onto the [-1, 1] marching-cubes cube
const OFFSET_Y = -0.16; // the roots are longer than the crown

// Signed distance helpers (after Inigo Quilez).
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const smax = (a, b, k) => -smin(-a, -b, k);
const sphere = (x, y, z, cx, cy, cz, r) => Math.hypot(x - cx, y - cy, z - cz) - r;
function roundBox(x, y, z, bx, by, bz, r) {
  const qx = Math.abs(x) - bx + r, qy = Math.abs(y) - by + r, qz = Math.abs(z) - bz + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
function roundCone(px, py, pz, a, b, r1, r2) {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pax = px - a[0], pay = py - a[1], paz = pz - a[2];
  const y = pax * bax + pay * bay + paz * baz, z = y - l2;
  const cx = pax * l2 - bax * y, cy = pay * l2 - bay * y, cz = paz * l2 - baz * y;
  const x2 = cx * cx + cy * cy + cz * cz, y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

function tooth(x, y, z) {
  // Crown: rounded block, slightly wider at its height of contour.
  const bulge = 1 + 0.07 * Math.exp(-(((y - 0.55) / 0.32) ** 2));
  let d = roundBox(x / bulge, y - 0.5, z / bulge, 0.6, 0.38, 0.52, 0.3);
  // Four cusps, then a central fossa carved between them.
  for (const [cx, cz, r] of [[-0.28, -0.24, 0.27], [0.3, -0.22, 0.26], [-0.27, 0.25, 0.25], [0.29, 0.23, 0.26]]) {
    d = smin(d, sphere(x, y, z, cx, 0.78, cz, r), 0.22);
  }
  d = smax(d, -sphere(x, y, z, 0, 1.12, 0, 0.32), 0.12);
  // Two roots (mesial, distal), diverging slightly, tapering to rounded apices.
  for (const s of [-1, 1]) d = smin(d, roundCone(x, y, z, [0.3 * s, 0.25, 0], [0.4 * s, -1.25, 0.04], 0.3, 0.1), 0.28);
  return d;
}

const mc = new MarchingCubes(RES, new MeshBasicMaterial(), false, false, 200_000);
mc.isolation = 0;
const half = RES / 2;
for (let k = 0; k < RES; k++)
  for (let j = 0; j < RES; j++)
    for (let i = 0; i < RES; i++) {
      const [x, y, z] = [((i - half) / half) * HALF, ((j - half) / half) * HALF + OFFSET_Y, ((k - half) / half) * HALF];
      mc.field[i + j * RES + k * RES * RES] = -tooth(x, y, z); // inside > 0
    }
mc.update();

const raw = new BufferGeometry();
const positions = mc.positionArray.slice(0, mc.count * 3);
for (let v = 0; v < positions.length; v += 3) {
  positions[v] *= HALF;
  positions[v + 1] = positions[v + 1] * HALF + OFFSET_Y;
  positions[v + 2] *= HALF;
}
raw.setAttribute("position", new BufferAttribute(positions, 3));
raw.setAttribute("normal", new BufferAttribute(mc.normalArray.slice(0, mc.count * 3), 3));
const geometry = mergeVertices(raw, 1e-5);
geometry.computeBoundingBox();
const { min, max } = geometry.boundingBox;

const p = geometry.attributes.position, n = geometry.attributes.normal;
const qPositions = new Int16Array(p.count * 3);
const qNormals = new Int8Array(p.count * 3);
const lo = [min.x, min.y, min.z], hi = [max.x, max.y, max.z];
for (let v = 0; v < p.count; v++) {
  const pos = [p.getX(v), p.getY(v), p.getZ(v)];
  const nrm = [n.getX(v), n.getY(v), n.getZ(v)];
  const len = Math.hypot(...nrm) || 1;
  for (let a = 0; a < 3; a++) {
    qPositions[v * 3 + a] = Math.round((((pos[a] - lo[a]) / (hi[a] - lo[a])) * 2 - 1) * 32767);
    qNormals[v * 3 + a] = Math.round((nrm[a] / len) * 127);
  }
}
const index = geometry.index.array;
const indices = p.count < 65536 ? Uint16Array.from(index) : Uint32Array.from(index);

const file = Buffer.from(encodeTooth({ positions: qPositions, normals: qNormals, indices, min: lo, max: hi }));
mkdirSync("public/models", { recursive: true });
writeFileSync("public/models/tooth.bin", file);
console.log(
  `tooth.bin: ${p.count} vertices, ${indices.length / 3} triangles, ${(file.length / 1024).toFixed(0)} KB raw, ` +
    `${(brotliCompressSync(file).length / 1024).toFixed(0)} KB brotli; size ${hi.map((h, a) => (h - lo[a]).toFixed(2)).join(" × ")}`,
);
