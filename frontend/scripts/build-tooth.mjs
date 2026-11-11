// Generates public/models/tooth.bin — the hero's procedural mandibular first molar, v2 (D-061, D-064).
// Signed distance field → marching cubes → vertices projected onto the exact surface → normals from the SDF
// gradient (smooth shading without faceting) → quantized. Run from frontend/:  node scripts/build-tooth.mjs
//
// Axes: x mesiodistal (mesial −, distal +), y occlusal ↑, z buccolingual (buccal + faces the camera).
import { mkdirSync, writeFileSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";
import { BufferAttribute, BufferGeometry, MeshBasicMaterial } from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { encodeTooth } from "../src/components/three/hero-tooth/toothFormat.ts";

const RES = 88; // marching-cubes grid: ≈26k triangles, inside the 30k / 150 KB budget (3D_HERO_MASTER_PLAN §11)
const HALF = 1.32; // world half-extent of the grid cube
const OFFSET_Y = -0.17; // grid centre: the roots are longer than the crown

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;

// Signed distance primitives and smooth booleans (after Inigo Quilez).
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
function roundBox(x, y, z, bx, by, bz, r) {
  const qx = Math.abs(x) - bx + r, qy = Math.abs(y) - by + r, qz = Math.abs(z) - bz + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
function ellipsoid(x, y, z, rx, ry, rz) {
  const k0 = Math.hypot(x / rx, y / ry, z / rz);
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
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
/** Distance in the xz plane from (x, z) to a polyline. */
function polyline2(x, z, points) {
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i], [bx, bz] = points[i + 1];
    const dx = bx - ax, dz = bz - az;
    const h = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
    best = Math.min(best, Math.hypot(x - ax - dx * h, z - az - dz * h));
  }
  return best;
}

// Occlusal anatomy of a lower first molar, seen from above: Y-shaped groove pattern between five cusps.
const CUSPS = [
  // [x, y, z, rx, ry, rz] — buccal row (z +): mesiobuccal, distobuccal, distal; lingual row (z −, taller)
  [-0.36, 0.84, 0.22, 0.25, 0.16, 0.24],
  [0.02, 0.85, 0.24, 0.24, 0.16, 0.23],
  [0.39, 0.81, 0.16, 0.19, 0.14, 0.19],
  [-0.27, 0.86, -0.24, 0.27, 0.17, 0.23],
  [0.25, 0.85, -0.25, 0.26, 0.17, 0.23],
];
const GROOVES = [
  [[-0.44, 0.02], [-0.2, -0.03], [0.01, 0.03], [0.21, -0.02], [0.44, 0.03]], // central
  [[-0.17, 0.0], [-0.17, 0.3], [-0.19, 0.62]], // mesiobuccal
  [[0.21, 0.0], [0.25, 0.25], [0.3, 0.55]], // distobuccal
  [[0.0, 0.03], [0.0, -0.3], [-0.02, -0.62]], // lingual
];
const PITS = [[0.01, 0.03, 0.03], [-0.44, 0.02, 0.022], [0.44, 0.03, 0.022]]; // central, mesial, distal [x, z, depth]

const smax = (a, b, k) => -smin(-a, -b, k);

function crown(x, y, z) {
  // One continuous body from the root trunk to the occlusal table: a superellipse (convex faces) lofted
  // along y — narrow at the cervix, flaring to the contact areas, converging again to the occlusal table.
  const wx = 0.4 + 0.04 * smoothstep(-0.35, 0.1, y) + 0.19 * smoothstep(0.05, 0.5, y) - 0.06 * smoothstep(0.7, 0.95, y);
  const wz = 0.37 + 0.04 * smoothstep(-0.35, 0.1, y) + 0.15 * smoothstep(0.05, 0.38, y) - 0.12 * smoothstep(0.5, 0.95, y);
  const n = 2.6;
  const f = (Math.abs(x / wx) ** n + Math.abs(z / wz) ** n) ** (1 / n);
  let d = (f - 1) * Math.min(wx, wz) * 0.9;
  d = smax(d, y - 0.88, 0.3); // rounded occlusal edge
  d = smax(d, -(y + 0.42), 0.15); // the trunk ends inside the roots
  for (const [cx, cy, cz, rx, ry, rz] of CUSPS) d = smin(d, ellipsoid(x - cx, y - cy, z - cz, rx, ry, rz), 0.17);
  // Grooves and pits: the surface is pushed inward (no tunnels) only on the occlusal table…
  const occlusal = smoothstep(0.8, 0.93, y);
  if (occlusal > 0) {
    let g = 0;
    for (const line of GROOVES) g = Math.max(g, Math.exp(-((polyline2(x, z, line) / 0.045) ** 2)));
    let pit = 0;
    for (const [px, pz, depth] of PITS) pit = Math.max(pit, depth * Math.exp(-((Math.hypot(x - px, z - pz) / 0.07) ** 2)));
    d += occlusal * (0.05 * g + pit);
  }
  // …plus the mesiobuccal groove running down the buccal face to its pit.
  d += 0.02 * Math.exp(-(((x + 0.19) / 0.04) ** 2)) * smoothstep(0.58, 0.7, y) * (1 - smoothstep(0.88, 0.95, y)) * smoothstep(0.25, 0.42, z);
  return d;
}

function roots(x, y, z) {
  // Mesial and distal roots: flat mesiodistally, broad buccolingually (z squashed), tapering to rounded
  // apices; the mesial root curves distally towards its apex.
  const bend = 0.1 * smoothstep(-0.45, -1.3, y) ** 2;
  const mesial = roundCone(x - bend, y, z * 0.6, [-0.2, -0.12, 0], [-0.37, -1.28, 0], 0.25, 0.08) * 0.8;
  const distal = roundCone(x - 0.4 * bend, y, z * 0.62, [0.2, -0.12, 0], [0.38, -1.17, 0], 0.25, 0.085) * 0.8;
  return smin(mesial, distal, 0.05);
}

/** Cemento-enamel junction height: dips towards the root on the buccal/lingual faces, rises on the proximal ones.
 *  Mirrored in ToothScene (`cej`) for the enamel → root material boundary. */
function cej(x, z) {
  const r2 = x * x + z * z;
  return 0.1 + (r2 > 1e-6 ? 0.035 * ((x * x - z * z) / r2) : 0);
}

function tooth(x, y, z) {
  let d = smin(crown(x, y, z), roots(x, y, z), 0.22);
  d += 0.006 * Math.exp(-(((y - cej(x, z)) / 0.022) ** 2)); // cervical line where the enamel ends
  return d;
}

const EPS = 1e-4;
function gradient(x, y, z) {
  const gx = tooth(x + EPS, y, z) - tooth(x - EPS, y, z);
  const gy = tooth(x, y + EPS, z) - tooth(x, y - EPS, z);
  const gz = tooth(x, y, z + EPS) - tooth(x, y, z - EPS);
  const l = Math.hypot(gx, gy, gz) || 1;
  return [gx / l, gy / l, gz / l];
}

// 1. Marching cubes over the field (inside > 0 for three's MarchingCubes).
const mc = new MarchingCubes(RES, new MeshBasicMaterial(), false, false, 400_000);
mc.isolation = 0;
const half = RES / 2;
for (let k = 0; k < RES; k++)
  for (let j = 0; j < RES; j++)
    for (let i = 0; i < RES; i++) {
      const x = ((i - half) / half) * HALF, y = ((j - half) / half) * HALF + OFFSET_Y, z = ((k - half) / half) * HALF;
      mc.field[i + j * RES + k * RES * RES] = -tooth(x, y, z);
    }
mc.update();

const raw = new BufferGeometry();
const soup = mc.positionArray.slice(0, mc.count * 3);
for (let v = 0; v < soup.length; v += 3) {
  soup[v] *= HALF;
  soup[v + 1] = soup[v + 1] * HALF + OFFSET_Y;
  soup[v + 2] *= HALF;
}
raw.setAttribute("position", new BufferAttribute(soup, 3));
const geometry = mergeVertices(raw, 1e-5);

// 2. Project every vertex onto the zero set (Newton steps) and take the normal from the SDF gradient.
const p = geometry.attributes.position;
const normals = new Float32Array(p.count * 3);
for (let v = 0; v < p.count; v++) {
  let x = p.getX(v), y = p.getY(v), z = p.getZ(v);
  for (let step = 0; step < 3; step++) {
    const d = tooth(x, y, z), [nx, ny, nz] = gradient(x, y, z);
    x -= d * nx;
    y -= d * ny;
    z -= d * nz;
  }
  p.setXYZ(v, x, y, z);
  normals.set(gradient(x, y, z), v * 3);
}

// 3. Drop triangles that collapsed to (near) zero area.
const index = geometry.index.array, kept = [];
for (let t = 0; t < index.length; t += 3) {
  const [a, b, c] = [index[t], index[t + 1], index[t + 2]];
  const ux = p.getX(b) - p.getX(a), uy = p.getY(b) - p.getY(a), uz = p.getZ(b) - p.getZ(a);
  const wx = p.getX(c) - p.getX(a), wy = p.getY(c) - p.getY(a), wz = p.getZ(c) - p.getZ(a);
  const area2 = Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
  if (a !== b && b !== c && a !== c && area2 > 1e-9) kept.push(a, b, c);
}

// 4. Quantize: positions int16 over the bounding box, normals int8.
geometry.computeBoundingBox();
const { min, max } = geometry.boundingBox;
const lo = [min.x, min.y, min.z], hi = [max.x, max.y, max.z];
const qPositions = new Int16Array(p.count * 3);
const qNormals = new Int8Array(p.count * 3);
for (let v = 0; v < p.count; v++) {
  const pos = [p.getX(v), p.getY(v), p.getZ(v)];
  for (let a = 0; a < 3; a++) {
    qPositions[v * 3 + a] = Math.round((((pos[a] - lo[a]) / (hi[a] - lo[a])) * 2 - 1) * 32767);
    qNormals[v * 3 + a] = Math.round(normals[v * 3 + a] * 127);
  }
}
const indices = p.count < 65536 ? Uint16Array.from(kept) : Uint32Array.from(kept);

const file = Buffer.from(encodeTooth({ positions: qPositions, normals: qNormals, indices, min: lo, max: hi }));
mkdirSync("public/models", { recursive: true });
writeFileSync("public/models/tooth.bin", file);
console.log(
  `tooth.bin: ${p.count} vertices, ${indices.length / 3} triangles, ${(file.length / 1024).toFixed(0)} KB raw, ` +
    `${(brotliCompressSync(file).length / 1024).toFixed(0)} KB brotli; size ${hi.map((h, a) => (h - lo[a]).toFixed(2)).join(" × ")}`,
);
