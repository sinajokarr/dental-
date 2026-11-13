// Procedural dental parts for the studio renders (D-081). Units are millimetres, +y is occlusal, +z faces the camera
// (labial / buccal). Every function returns a BufferGeometry; the materials live in jobs.js.
import * as THREE from "three";

export const sstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Grid surface: point(u, v) → [x, y, z, r?, g?, b?]. wrapU closes the u direction (no seam, continuous normals). */
export function grid(nu, nv, point, { wrapU = false, flip = false } = {}) {
  const pos = [], col = [], uvs = [];
  const cu = wrapU ? nu : nu + 1;
  for (let j = 0; j <= nv; j++)
    for (let i = 0; i < cu; i++) {
      const p = point(i / nu, j / nv);
      pos.push(p[0], p[1], p[2]);
      uvs.push(i / nu, j / nv);
      if (p.length > 3) col.push(p[3], p[4], p[5]);
    }
  const idx = [];
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const i1 = wrapU ? (i + 1) % nu : i + 1;
      const a = j * cu + i, b = j * cu + i1, c = (j + 1) * cu + i, d = (j + 1) * cu + i1;
      if (flip) idx.push(a, b, c, b, d, c);
      else idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  if (col.length) g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Implant fixture: tapered body, rounded apex, a real helical thread (radius modulated by the helix phase). */
export function fixture({ length = 10.5, rTop = 2.05, rBot = 1.55, pitch = 0.6, depth = 0.2 } = {}) {
  const base = (y) => {
    let r = rBot + (rTop - rBot) * (y / length);
    const apex = 1.3;
    if (y < apex) {
      const t = (apex - y) / apex;
      r *= Math.sqrt(Math.max(0, 1 - t * t));
    }
    if (y > length - 0.35) r *= 1 - 0.07 * ((y - (length - 0.35)) / 0.35);
    return r;
  };
  return grid(220, 440, (u, v) => {
    const y = v * length, th = u * Math.PI * 2;
    let r = base(y);
    const phase = (((y / pitch - u) % 1) + 1) % 1;
    const thread = Math.pow(0.5 - 0.5 * Math.cos(phase * Math.PI * 2), 1.35);
    r += depth * thread * sstep(0.7, 2.4, y) * (1 - sstep(length - 1.6, length - 0.7, y));
    return [r * Math.cos(th), y, r * Math.sin(th)];
  }, { wrapU: true });
}

/** Lathe from a smooth (r, y) profile (Catmull-Rom through the points). */
export function lathe(points, segments = 128, samples = 90) {
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
  return new THREE.LatheGeometry(curve.getPoints(samples), segments);
}

/** Abutment: hex-collar base, conical neck, rounded top. Origin at its base. */
export function abutment() {
  return lathe([[0.01, 0], [1.9, 0], [1.97, 0.12], [1.97, 0.85], [1.62, 1.0], [1.3, 1.55], [1.12, 3.0], [1.04, 4.2], [0.92, 4.62], [0.5, 4.78], [0.01, 4.8]], 160, 120);
}

/** Gingival cuff: soft tissue that rises from the bone level and hugs the abutment neck, with a scalloped margin.
 *  Origin at the implant platform (y = 0 is the top of the fixture). */
export function gum() {
  const g = lathe([[0.02, -1.2], [3.7, -1.2], [3.75, -0.3], [3.35, 0.45], [2.75, 0.95], [2.2, 1.35], [1.82, 1.62], [1.62, 1.78], [1.5, 1.7], [1.5, 1.2], [1.5, -1.2]], 180, 140);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const w = sstep(0.8, 1.7, y); // only the margin scallops
    p.setY(i, y + w * 0.3 * Math.cos(2 * Math.atan2(z, x)));
  }
  g.computeVertexNormals();
  return g;
}

/** Crown from the project's molar model (public/models/tooth.bin): everything above the cemento-enamel junction. */
export function crownFromModel(data, { scale = 4.7 } = {}) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(data.positions.length), nor = new Float32Array(data.normals.length);
  for (let i = 0; i < pos.length; i += 3) {
    const x = data.positions[i], y = data.positions[i + 1], z = data.positions[i + 2];
    pos[i] = x * scale; pos[i + 1] = y * scale; pos[i + 2] = z * scale;
  }
  nor.set(data.normals);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setIndex(new THREE.BufferAttribute(Uint32Array.from(data.indices), 1));
  return g;
}

// ───────────────────────────── natural front teeth ─────────────────────────────
// A lofted tooth: superellipse sections (mesiodistal half-width a, labiolingual half-depth b) from the root apex to the
// incisal edge, y = 0 at the cemento-enamel junction. Incisal edge: slightly curved, with mamelon ripple; canines and
// premolars add a cusp. Vertex colours: cementum root, warm cervical enamel, bluish translucent incisal edge.
const sgnpow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

export function toothSection(y, o) {
  const { W, H, T, root, n = 2.5 } = o;
  let a, b, exp = n, dx = 0;
  if (y >= 0) {
    const t = sstep(0, 0.78 * H, y);
    a = (W / 2) * (0.64 + 0.36 * Math.sin((Math.PI / 2) * t)); // convex mesial and distal outline, widest in the incisal third
    const bulge = 0.9 * Math.exp(-Math.pow((y - 0.2 * H) / (0.22 * H), 2)); // cervical (gingival-third) convexity of the labial surface
    b = 0.5 + (T / 2 - 0.5) * Math.pow(1 - sstep(0.12 * H, 0.99 * H, y), 1.15) + bulge;
  } else {
    const s = Math.min(-y / root, 1);
    const a0 = (W / 2) * 0.64, b0 = T / 2;
    const taper = 1 - 0.62 * Math.pow(s, 1.25);
    const apex = Math.sqrt(Math.max(0, 1 - Math.pow(s, 7)));
    a = a0 * taper * apex;
    b = b0 * 0.92 * taper * apex;
    dx = 0.7 * s * s; // roots curve slightly distally
    exp = lerpN(n, 2, s);
  }
  if (y > H) {
    const f = Math.sqrt(Math.max(0, 1 - Math.pow((y - H) / 0.5, 2)));
    a *= Math.pow(f, 0.5);
    b *= f;
  }
  return { a, b, zc: 0.28 * b, exp, dx };
}
const lerpN = (a, b, t) => a + (b - a) * t;

function toothColor(y, o) {
  const { H } = o;
  const mix = (c1, c2, t) => c1.map((v, i) => v + (c2[i] - v) * Math.min(Math.max(t, 0), 1));
  const root = [0.9, 0.81, 0.64], cervical = [0.93, 0.85, 0.7], body = [0.95, 0.91, 0.82], edge = [0.8, 0.86, 0.92];
  if (y < 0) return mix(root, [0.84, 0.74, 0.58], -y / o.root);
  let c = mix(root, cervical, y / 0.5);
  c = mix(c, body, (y - 0.5) / (0.35 * H));
  return mix(c, edge, (y - 0.82 * H) / (0.17 * H));
}

export function tooth(o = {}) {
  const opts = { W: 8.6, H: 10.6, T: 7, root: 13, cusp: 0, ripple: 0.07, ...o };
  const { H, root } = opts;
  const y0 = -root, y1 = H + 0.5;
  const g = grid(144, 280, (u, v) => {
    const y = y0 + v * (y1 - y0), th = u * Math.PI * 2;
    const { a, b, zc, exp, dx } = toothSection(y, opts);
    const c = Math.cos(th), s = Math.sin(th);
    let x = dx + a * sgnpow(c, 2 / exp), z = zc + b * sgnpow(s, 2 / exp);
    let yy = y;
    if (y > 0.78 * H) {
      const w = sstep(0.78 * H, H, y);
      const ax = Math.abs(x) / Math.max(a, 1e-3);
      yy += -w * 0.55 * Math.pow(ax, 2.2) + opts.ripple * w * Math.cos((6 * Math.PI * x) / opts.W);
      if (opts.cusp) yy += opts.cusp * w * Math.pow(Math.max(0, 1 - ax), 1.4);
    }
    if (z > zc + 0.45 * b) z += 0.006 * Math.sin(y * 22 + 2.5 * Math.sin(x * 1.3)) * sstep(0, 1.2, y) * sstep(0.45, 0.8, (z - zc) / b); // fine labial growth lines, only on the labial face
    return [x, yy, z, ...toothColor(y, opts)];
  }, { wrapU: true, flip: true });
  g.userData.opts = opts;
  return g;
}

/** A thin porcelain shell that follows the labial surface of `tooth(o)`: from just above the gum margin to the incisal edge. */
export function veneerShell(o = {}, { thickness = 0.5, margin = 0.9, cover = 0.93 } = {}) {
  const opts = { W: 8.6, H: 10.6, T: 7, root: 13, cusp: 0, ripple: 0.07, ...o };
  const { H } = opts;
  const point = (u, v, off) => {
    const y = margin + v * (H - margin);
    const { a, b, zc, exp } = toothSection(y, opts);
    const x = u * a * cover;
    const rel = Math.max(0, 1 - Math.pow(Math.abs(x) / a, exp));
    const z = zc + b * Math.pow(rel, 1 / exp);
    // outward normal of the superellipse (x/a)^n + (z/b)^n = 1, labial side
    const nx = (Math.sign(x) * Math.pow(Math.abs(x) / a, exp - 1)) / a;
    const nz = Math.pow(Math.abs(z - zc) / b, exp - 1) / b;
    const len = Math.hypot(nx, nz) || 1;
    let yy = y;
    if (y > 0.78 * H) {
      const w = sstep(0.78 * H, H, y), ax = Math.abs(x) / a;
      yy += -w * 0.55 * Math.pow(ax, 2.2) + opts.ripple * w * Math.cos((6 * Math.PI * x) / opts.W);
      if (opts.cusp) yy += opts.cusp * w * Math.pow(Math.max(0, 1 - ax), 1.4);
    }
    return [x + (nx / len) * off, yy, z + (nz / len) * off];
  };
  const NU = 48, NV = 90;
  const sheet = (off, flip) => grid(NU, NV, (u, v) => point(u * 2 - 1, v, off), { flip });
  const outer = sheet(thickness, false), inner = sheet(0.04, true);
  // edge strips joining the two sheets
  const strips = [];
  const strip = (fn) => strips.push(grid(NV, 1, (i, j) => (j === 0 ? fn(i, thickness) : fn(i, 0.04))));
  strip((i, off) => point(-1, i, off));
  strip((i, off) => point(1, i, off));
  strip((i, off) => point(i * 2 - 1, 0, off));
  strip((i, off) => point(i * 2 - 1, 1, off));
  return [outer, inner, ...strips];
}

/** Gingival collar around the neck of `tooth(o)`: soft tissue with scalloped margin (papillae higher at the proximal sides). */
export function toothGum(o = {}) {
  const opts = { W: 8.6, H: 10.6, T: 7, root: 13, cusp: 0, ripple: 0.07, ...o };
  const bottom = o.gumBottom ?? -5.5;
  return grid(144, 90, (u, v) => {
    const th = u * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th);
    const top = 0.3 + 2.2 * Math.pow(Math.abs(c), 4);
    const y = bottom + v * (top - bottom);
    const { a, b, zc, exp, dx } = toothSection(y, opts);
    const edge = 1 - sstep(0.82, 1, v) * 0.93; // rolled margin: thinner at the top
    const foot = sstep(0, 0.12, v); // …and at the bottom
    const off = (0.34 * edge * foot + 0.04) * (o.gumScale ?? 1);
    const ra = a + off, rb = b + off;
    return [dx + ra * sgnpow(c, 2 / exp), y, zc + rb * sgnpow(sn, 2 / exp)];
  }, { wrapU: true, flip: true });
}

/** Alveolar gum plate behind a row of teeth: follows the dental arch (radius R), its lower edge is the gingival margin
 *  (zeniths at the tooth centres, papillae between them), its top fades out. `edge(alpha)` gives the margin height. */
export function archGum({ R, alpha, edge, height = 15 }) {
  return grid(220, 46, (u, v) => {
    const a = (u * 2 - 1) * alpha;
    const r = R + 4.4 - 3.4 * v;
    const y0 = edge(a);
    return [r * Math.sin(a), y0 + v * height, -(r * (1 - Math.cos(a)))];
  }, { flip: true });
}
