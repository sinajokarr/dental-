// V7 parts (D-091): a lower dental arch with implants and a fixed full-arch bridge, sectioned bone blocks for bone grafting
// and sinus lift, graft granules, membranes. Millimetres, +y occlusal, +z towards the camera — as in geometry.js.
import * as THREE from "three";
import { grid, sstep } from "/geometry.js";

const sgnpow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

/** Seeded random numbers, so every render of a job gives the same pixels. */
export function random(seed = 7) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Centre line of a lower dental arch: t ∈ [-1, 1], 0 at the midline. Frames give position, outward normal and the
 *  y-rotation that turns +z (labial) outwards; `at(s)` places by signed arc length from the midline. */
export function archLine({ A = 23, B = 30, th = 1.45 } = {}) {
  const point = (t) => new THREE.Vector3(A * Math.sin(t * th), 0, -B * (1 - Math.cos(t * th)));
  const N = 800, ts = [], ss = [0];
  let prev = point(-1);
  ts.push(-1);
  for (let i = 1; i <= N; i++) {
    const t = -1 + (2 * i) / N, p = point(t);
    ss.push(ss[i - 1] + p.distanceTo(prev));
    ts.push(t);
    prev = p;
  }
  const half = ss[N] / 2;
  const frame = (t) => {
    const p = point(t), tan = point(Math.min(1, t + 1e-3)).sub(point(Math.max(-1, t - 1e-3))).normalize();
    const nrm = new THREE.Vector3(-tan.z, 0, tan.x);
    return { p, tan, nrm, rotY: Math.atan2(nrm.x, nrm.z) };
  };
  const tAt = (s) => {
    const target = half + s;
    let i = 1;
    while (i < N && ss[i] < target) i++;
    const f = (target - ss[i - 1]) / (ss[i] - ss[i - 1]);
    return ts[i - 1] + f * (ts[i] - ts[i - 1]);
  };
  return { frame, tAt, at: (s) => frame(tAt(s)), half };
}

/** Sweep a closed profile along the arch. profile(u) → [n (outward), y, yCentre]; ends close as rounded tips. */
export function sweep(line, profile, { t0 = -1, t1 = 1, nu = 120, nv = 320, tip = 0.05, open = false } = {}) {
  return grid(nu, nv, (u, v) => {
    const t = t0 + (t1 - t0) * v, f = line.frame(t);
    const e = Math.min(v, 1 - v);
    const k = !open && e < tip ? Math.sqrt(Math.max(0, 1 - ((tip - e) / tip) ** 2)) : 1;
    const [n, y, yc] = profile(u);
    const nn = n * k, yy = yc + (y - yc) * k;
    return [f.p.x + f.nrm.x * nn, yy, f.p.z + f.nrm.z * nn];
  }, { wrapU: !open });
}

/** Mandibular body section: narrow alveolar crest at y = 0, wider basal bone below. */
export const jawProfile = ({ H = 21, top = 4.1, bottom = 6.2, p = 3.2 } = {}) => (u) => {
  const ph = u * Math.PI * 2;
  const cx = sgnpow(Math.sin(ph), 2 / p), cy = sgnpow(Math.cos(ph), 2 / p);
  const y = -H / 2 + (H / 2) * cy;
  const w = top + (bottom - top) * sstep(0, 0.55, -y / H);
  return [w * cx - 0.6 * sstep(0.3, 1, -y / H), y, -H / 2];
};

/** Gingiva over the crest: an open strip from the lingual to the buccal side (u = 0 → 1), fading at both edges. */
export const gumProfile = ({ depth = 7.5, lift = 1.6, top = 4.6, bottom = 6.0 } = {}) => (u) => {
  const ph = (u - 0.5) * Math.PI * 1.25; // −112° … +112° around the crest
  const s = Math.sin(ph), c = Math.cos(ph);
  const y = lift - (lift + depth) * (1 - c) / (1 - Math.cos(Math.PI * 0.625));
  const w = top + (bottom - top) * sstep(0, 1, -y / depth);
  return [w * sgnpow(s, 0.75), y, 0];
};

/** Prosthetic base of a fixed full-arch bridge (the pink part that carries the teeth). */
export const bridgeBaseProfile = ({ H = 5.2, W = 5.4, p = 3.4 } = {}) => (u) => {
  const ph = u * Math.PI * 2;
  return [W * sgnpow(Math.sin(ph), 2 / p), -H / 2 + (H / 2) * sgnpow(Math.cos(ph), 2 / p), -H / 2];
};

/** Horizontal alpha ramp (u) for the open gum strip: transparent at both edges. */
export function edgeFadeMap(T, edge = 0.2) {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 4;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#000"); g.addColorStop(edge, "#fff"); g.addColorStop(1 - edge, "#fff"); g.addColorStop(1, "#000");
  x.fillStyle = g; x.fillRect(0, 0, 256, 4);
  return new T.CanvasTexture(c);
}

/** Cancellous-bone texture for cut faces: soft pores on warm ivory. */
export function poreMap(T, seed = 3) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = "#efe4cf"; x.fillRect(0, 0, 512, 512);
  const r = random(seed);
  for (let i = 0; i < 1400; i++) {
    const px = r() * 512, py = r() * 512, rad = 2 + r() * 7;
    const g = x.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, "rgba(176,140,98,0.55)"); g.addColorStop(1, "rgba(176,140,98,0)");
    x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, Math.PI * 2); x.fill();
  }
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.colorSpace = T.SRGBColorSpace;
  return t;
}

/** Smooth closed outline through points (Catmull-Rom), as a THREE.Shape. */
export function smoothShape(points, holes = [], samples = 240) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, "centripetal");
  const shape = new THREE.Shape(curve.getPoints(samples).map((p) => new THREE.Vector2(p.x, p.y)));
  for (const hole of holes) {
    const h = new THREE.CatmullRomCurve3(hole.map(([x, y]) => new THREE.Vector3(x, y, 0)), true, "centripetal");
    shape.holes.push(new THREE.Path(h.getPoints(samples).map((p) => new THREE.Vector2(p.x, p.y))));
  }
  return shape;
}

/** A sectioned block: the outline extruded along z (front face at z = depth / 2), softly bevelled. */
export function block(shape, { depth = 12, bevel = 0.5 } = {}) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 120 });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

/** An open band along a smooth curve: membranes and soft-tissue layers seen in section. */
export function band(points, { thickness = 0.35, depth = 12 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, "centripetal");
  const pts = curve.getPoints(200);
  const outer = [], inner = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const nx = -(b.y - a.y), ny = b.x - a.x, l = Math.hypot(nx, ny) || 1;
    outer.push(new THREE.Vector2(pts[i].x + (nx / l) * thickness / 2, pts[i].y + (ny / l) * thickness / 2));
    inner.push(new THREE.Vector2(pts[i].x - (nx / l) * thickness / 2, pts[i].y - (ny / l) * thickness / 2));
  }
  const shape = new THREE.Shape([...outer, ...inner.reverse()]);
  return block(shape, { depth, bevel: Math.min(0.12, thickness / 3) });
}

/** Graft granules filling a region: inside(x, y) decides; irregular, slightly flattened polyhedra. */
export function granules(inside, { box, count = 500, size = [0.35, 0.75], depth = 12, seed = 11 } = {}) {
  const r = random(seed), geos = [];
  let tries = 0;
  while (geos.length < count && tries++ < count * 40) {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]);
    if (!inside(x, y)) continue;
    const s = size[0] + r() * (size[1] - size[0]);
    const g = new THREE.IcosahedronGeometry(s, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.8 + r() * 0.4), p.getY(i) * (0.7 + r() * 0.4), p.getZ(i) * (0.8 + r() * 0.4));
    g.rotateX(r() * 6.3); g.rotateY(r() * 6.3);
    g.translate(x, y, depth / 2 - r() * 0.9);
    geos.push(g.index ? g.toNonIndexed() : g);
  }
  const merged = mergeGeometries(geos);
  merged.computeVertexNormals();
  return merged;
}

function mergeGeometries(list) {
  const total = list.reduce((n, g) => n + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o);
    o += g.attributes.position.array.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return out;
}

/** Tint a tooth's vertex colours (shade tabs): mix towards a target colour, keeping the natural gradient. */
export function tint(geometry, [r, g, b], amount = 0.55) {
  const c = geometry.attributes.color;
  for (let i = 0; i < c.count; i++) c.setXYZ(i, c.getX(i) + (r - c.getX(i)) * amount, c.getY(i) + (g - c.getY(i)) * amount, c.getZ(i) + (b - c.getZ(i)) * amount);
  return geometry;
}
