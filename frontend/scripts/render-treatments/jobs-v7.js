// V7 renders (D-091): full arch (All-on-4 / All-on-6), bone grafting, sinus lift, CAD/CAM crown, shade tabs.
// Same studio as D-081 (stage.js): physically based materials, one camera per job, layers that stack exactly.
import { abutment, crownFromModel, fixture, tooth } from "/geometry.js";
import { archLine, band, block, bridgeBaseProfile, edgeFadeMap, granules, gumProfile, jawProfile, poreMap, smoothShape, sweep, tint } from "/geometry-v7.js";

const titanium = (T) => new T.MeshStandardMaterial({ color: 0xc3c7cc, metalness: 1, roughness: 0.3 });
const anodized = (T) => new T.MeshStandardMaterial({ color: 0xd6bf8c, metalness: 1, roughness: 0.27 });
const gingiva = (T) => new T.MeshPhysicalMaterial({ color: 0xd48f8a, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.35, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new T.Color(0xffb9b2), side: T.DoubleSide });
const enamel = (T) => new T.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.24, clearcoat: 0.75, clearcoatRoughness: 0.14, sheen: 0.28, sheenRoughness: 0.45, sheenColor: new T.Color(0xfff2e0) });
const porcelain = (T) => new T.MeshPhysicalMaterial({ color: 0xf7f2ea, roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.1, sheen: 0.3, sheenRoughness: 0.4, sheenColor: new T.Color(0xfff4e6), ior: 1.5 });
const bone = (T, opts = {}) => new T.MeshPhysicalMaterial({ color: 0xeee2cb, roughness: 0.62, sheen: 0.3, sheenColor: new T.Color(0xfff3dc), ...opts });
const graftMaterial = (T) => new T.MeshStandardMaterial({ color: 0xf1e9db, roughness: 0.6 });
const membraneMaterial = (T) => new T.MeshPhysicalMaterial({ color: 0xf3ead8, roughness: 0.45, transparent: true, opacity: 0.85, sheen: 0.4, sheenColor: new T.Color(0xffffff), side: T.DoubleSide });
const lining = (T) => new T.MeshPhysicalMaterial({ color: 0xe5a49c, roughness: 0.45, clearcoat: 0.3, sheen: 0.5, sheenColor: new T.Color(0xffc8c0), side: T.DoubleSide });

const project = (camera, T) => (x, y, z) => {
  const p = new T.Vector3(x, y, z).project(camera);
  return [Math.round(((p.x + 1) / 2) * 10000) / 10, Math.round(((1 - p.y) / 2) * 10000) / 10];
};

// ───────────────────────── full arch: lower jaw, All-on-4 / All-on-6, fixed bridge ─────────────────────────
const LINE = { A: 23, B: 30, th: 1.45 };
const LIFT = 6.7; // the bridge seated on the gum; the page lowers it into place once (CSS translate)
// Implant sites by arc length from the midline (mm) and tilt (rad, top towards distal). All-on-4: two upright anterior,
// two posterior tilted by about 30°; All-on-6: six upright, spread along the arch. Teaching positions, not a plan.
const SITES = {
  four: [{ s: -9, tilt: 0, len: 11 }, { s: 9, tilt: 0, len: 11 }, { s: -27, tilt: 0.52, len: 13 }, { s: 27, tilt: 0.52, len: 13 }],
  six: [{ s: -7.5, tilt: 0, len: 11 }, { s: 7.5, tilt: 0, len: 11 }, { s: -20, tilt: 0.1, len: 11 }, { s: 20, tilt: 0.1, len: 11 }, { s: -33, tilt: 0.12, len: 10 }, { s: 33, tilt: 0.12, len: 10 }],
};
// Lower teeth from the midline outwards: central, lateral, canine, two premolars, first molar (mesiodistal widths, mm).
const TEETH = [
  { W: 5.2, H: 6.6, T: 5.4, ripple: 0.04 },
  { W: 5.7, H: 6.9, T: 5.7, ripple: 0.04 },
  { W: 6.3, H: 7.0, T: 6.4, cusp: 0.6 },
  { W: 7.0, molar: 3.9 },
  { W: 7.1, molar: 4.0 },
  { W: 10.4, molar: 5.6 },
];

function fullArch(assets, T) {
  const line = archLine(LINE);
  const parts = {};
  const boneMaterial = bone(T, { transparent: true, opacity: 0.27, depthWrite: false, side: T.DoubleSide });
  parts.bone = { geometry: sweep(line, jawProfile(), { t0: -0.97, t1: 0.97 }), material: boneMaterial };
  const gumMaterial = gingiva(T);
  gumMaterial.transparent = true; gumMaterial.alphaMap = edgeFadeMap(T, 0.22); gumMaterial.depthWrite = true;
  parts.gum = { geometry: sweep(line, gumProfile({ depth: 3.4, lift: 1.4, top: 4.4, bottom: 5.0 }), { t0: -0.93, t1: 0.93, open: true, nu: 90 }), material: gumMaterial };

  for (const [set, sites] of Object.entries(SITES)) {
    sites.forEach((site, i) => {
      const f = line.at(site.s), side = Math.sign(site.s);
      const fix = fixture({ length: site.len });
      parts[`${set}Fixture${i}`] = {
        geometry: fix,
        material: titanium(T),
        group: (m) => {
          const wrap = new T.Group();
          wrap.position.set(f.p.x, 0.2, f.p.z);
          wrap.rotation.y = f.rotY;
          const pivot = new T.Group();
          pivot.rotation.z = -side * site.tilt; // top leans distally, apex mesially
          m.position.y = -site.len;
          pivot.add(m);
          wrap.add(pivot);
          return wrap;
        },
      };
      // Multi-unit abutment: upright, so a tilted implant still meets the bridge on a common path.
      parts[`${set}Abutment${i}`] = {
        geometry: abutment(),
        material: anodized(T),
        group: (m) => {
          const wrap = new T.Group();
          wrap.position.set(f.p.x, 0.2, f.p.z);
          m.scale.setScalar(0.66);
          return wrap;
        },
      };
    });
  }

  // The bridge: pink base along the arch, porcelain teeth on top, lifted by LIFT.
  let s = 0;
  const centres = TEETH.map((t) => { const c = s + t.W / 2; s += t.W * 0.98; return c; });
  const end = line.tAt(s + 0.8);
  parts.bridgeBase = { geometry: sweep(line, bridgeBaseProfile(), { t0: -end, t1: end, tip: 0.04 }), material: gingiva(T), place: (m) => m.position.set(0, LIFT, 0) };
  for (const side of [-1, 1])
    TEETH.forEach((spec, k) => {
      const f = line.at(side * centres[k]);
      const geometry = spec.molar ? crownFromModel(assets.tooth, { scale: spec.molar }) : tooth({ ...spec, root: 1.2 });
      parts[`tooth${side > 0 ? "R" : "L"}${k}`] = {
        geometry,
        material: spec.molar ? porcelain(T) : enamel(T),
        group: (m) => {
          const wrap = new T.Group();
          wrap.position.set(f.p.x, LIFT - 0.4, f.p.z);
          wrap.rotation.y = f.rotY;
          if (spec.molar) m.position.y = -0.1 * spec.molar;
          return wrap;
        },
      };
    });
  return parts;
}

// ───────────────────────── sectioned blocks: bone grafting and sinus lift ─────────────────────────
// Bone grafting — a lower ridge seen in cross-section (buccal +x). Stage 1 the ridge has lost width on the buccal side;
// stage 2 granules and a membrane rebuild the contour; stage 3 the graft has become bone and holds an implant.
const NARROW = [[-3.2, 0.2], [-1.6, 0.9], [-0.2, 0.8], [0.7, -0.4], [1.0, -2.5], [1.5, -5.5], [2.6, -9], [4.4, -12.6], [5.6, -15.5], [5.9, -18], [4.6, -22.5], [0, -24.2], [-4.6, -22.6], [-6.0, -18], [-5.4, -12], [-4.4, -6], [-3.8, -2.2]];
const WIDE = [[-3.2, 0.2], [-1.4, 1.0], [1.4, 1.0], [3.4, 0.1], [4.6, -2.4], [5.2, -6], [5.6, -11], [5.9, -18], [4.6, -22.5], [0, -24.2], [-4.6, -22.6], [-6.0, -18], [-5.4, -12], [-4.4, -6], [-3.8, -2.2]];
const inPoly = (poly) => (x, y) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

function boneBlock(T, outline, holes = []) {
  const pores = poreMap(T);
  pores.repeat.set(0.09, 0.09);
  const face = bone(T, { map: pores, roughness: 0.75 });
  const side = bone(T);
  return { geometry: block(smoothShape(outline, holes), { depth: 12, bevel: 0.45 }), material: [face, side] };
}

function graft(assets, T) {
  const parts = {};
  parts.ridge = boneBlock(T, NARROW);
  parts.newBone = boneBlock(T, WIDE);
  const gap = (x, y) => inPoly(WIDE)(x, y) && !inPoly(NARROW)(x + 0.15, y) && y > -15;
  parts.granules = { geometry: granules(gap, { box: [-2, -15, 6.5, 1.4], count: 1800, size: [0.32, 0.62] }), material: graftMaterial(T) };
  parts.membrane = { geometry: band([[-2.6, 1.35], [0.4, 1.55], [3.0, 0.75], [4.85, -2.2], [5.55, -6.5], [5.95, -12], [6.1, -15.5]], { thickness: 0.32, depth: 12.4 }), material: membraneMaterial(T) };
  parts.gumNarrow = { geometry: band([[-6.2, -5], [-4.5, -0.6], [-2.4, 1.7], [-0.2, 1.9], [1.4, 0.7], [1.95, -2.4], [2.6, -6.2]], { thickness: 1.8, depth: 12.6 }), material: gingiva(T) };
  parts.gumWide = { geometry: band([[-6.2, -5], [-4.5, -0.6], [-2.4, 2.3], [0.6, 2.75], [3.6, 1.8], [5.7, -1.6], [6.5, -6], [6.8, -9]], { thickness: 1.8, depth: 12.6 }), material: gingiva(T) };
  parts.implant = { geometry: fixture({ length: 11 }), material: titanium(T), place: (m) => m.position.set(0.6, -11 + 0.6, 6) };
  return parts;
}

// Sinus lift — the upper back jaw in section, crest at the bottom (y = 0), the maxillary sinus above it.
const MAXILLA = [[-14, 0.2], [-6, 0.9], [0, 1.1], [6, 0.9], [14, 0.2], [15.5, 8], [15.5, 26], [-15.5, 26], [-15.5, 8]];
const SINUS = [[-11, 4.2], [-5, 3.0], [0, 2.9], [5, 3.0], [11, 4.2], [12.6, 11], [11, 20.5], [0, 23], [-11, 20.5], [-12.6, 11]];
const lifted = (x) => 2.9 + 10.5 * Math.pow(Math.max(0, 1 - (x / 9.4) ** 2), 0.75); // membrane after lifting

function sinus(assets, T) {
  const parts = {};
  parts.maxilla = boneBlock(T, MAXILLA, [SINUS]);
  const floorPts = [[-11.4, 5.2], [-8, 3.75], [-4, 3.35], [0, 3.3], [4, 3.35], [8, 3.75], [11.4, 5.2]];
  parts.liningLow = { geometry: band(floorPts, { thickness: 0.45, depth: 11.8 }), material: lining(T) };
  const liftedPts = [-11.6, -10, -8, -5.5, -3, 0, 3, 5.5, 8, 10, 11.6].map((x) => [x, Math.abs(x) > 9.4 ? 3.2 + (Math.abs(x) - 9.4) * 0.8 : lifted(x)]);
  parts.liningHigh = { geometry: band(liftedPts, { thickness: 0.45, depth: 11.8 }), material: lining(T) };
  const inside = (x, y) => y > 3.3 && y < lifted(x) - 0.45 && Math.abs(x) < 9.2;
  parts.granules = { geometry: granules(inside, { box: [-9.4, 3, 9.4, 13.6], count: 1500, size: [0.34, 0.66], depth: 11.6 }), material: graftMaterial(T) };
  parts.newBone = { geometry: block(smoothShape([-9.2, -7, -4, 0, 4, 7, 9.2].map((x) => [x, lifted(x) - 0.4]).concat([[8, 3.3], [0, 3.2], [-8, 3.3]])), { depth: 11.6, bevel: 0.3 }), material: bone(T, { map: (() => { const p = poreMap(T, 5); p.repeat.set(0.09, 0.09); return p; })(), roughness: 0.75 }) };
  parts.gum = { geometry: band([[-15.6, 0.6], [-10, -0.75], [-4, -1.15], [0, -1.2], [4, -1.15], [10, -0.75], [15.6, 0.6]], { thickness: 2.2, depth: 12.4 }), material: gingiva(T) };
  parts.implant = { geometry: fixture({ length: 11.5 }), material: titanium(T), place: (m) => { m.rotation.z = Math.PI; m.position.set(0, 11.5 + 0.8, 6); } };
  return parts;
}

// Shade tabs: eight natural shades from light to darker on stems, like a dentist's shade guide (VITA-like order).
const SHADES = [[0.97, 0.95, 0.9], [0.95, 0.91, 0.82], [0.93, 0.87, 0.75], [0.91, 0.83, 0.68], [0.88, 0.79, 0.61], [0.85, 0.75, 0.55], [0.81, 0.7, 0.5], [0.77, 0.65, 0.45]];

export const V7_JOBS = {
  fullarch: {
    size: 2400,
    out: 1400,
    fov: 21,
    envIntensity: 0.6,
    key: 2.9,
    fill: 0.5,
    rim: 1.0,
    parts: fullArch,
    camera(cam, T) {
      cam.position.set(0, 100, 116);
      cam.lookAt(new T.Vector3(0, -3.5, -14));
    },
    meta(parts, camera, T) {
      const px = project(camera, T);
      const out = {};
      for (const set of ["four", "six"]) {
        out[set] = Object.keys(parts).filter((id) => id.startsWith(`${set}Abutment`)).map((id) => {
          const p = parts[id].position;
          return { top: px(p.x, 3.4, p.z), bridge: px(p.x, LIFT - 2.6, p.z) };
        });
      }
      return out;
    },
    layers: [
      { name: "four-fixtures", show: ["fourFixture0", "fourFixture1", "fourFixture2", "fourFixture3"] },
      { name: "six-fixtures", show: ["sixFixture0", "sixFixture1", "sixFixture2", "sixFixture3", "sixFixture4", "sixFixture5"] },
      { name: "bone", show: ["bone"] },
      { name: "gum", show: ["gum"] },
      { name: "four-abutments", show: ["fourAbutment0", "fourAbutment1", "fourAbutment2", "fourAbutment3"], occlude: ["gum"] },
      { name: "six-abutments", show: ["sixAbutment0", "sixAbutment1", "sixAbutment2", "sixAbutment3", "sixAbutment4", "sixAbutment5"], occlude: ["gum"] },
      { name: "bridge", show: ["bridgeBase", ...["L", "R"].flatMap((s) => [0, 1, 2, 3, 4, 5].map((k) => `tooth${s}${k}`))] },
    ],
  },
  graft: {
    size: 2000,
    fov: 20,
    envIntensity: 0.65,
    camera(cam, T) {
      cam.position.set(-38, 6, 100);
      cam.lookAt(new T.Vector3(0.8, -10.5, 0));
    },
    layers: [
      { name: "ridge", show: ["ridge"] },
      { name: "new-bone", show: ["newBone"] },
      { name: "granules", show: ["granules"], occlude: ["ridge"] },
      { name: "membrane", show: ["membrane"], occlude: ["ridge", "granules"] },
      { name: "gum-narrow", show: ["gumNarrow"], occlude: ["ridge"] },
      { name: "gum-wide", show: ["gumWide"], occlude: ["newBone"] },
      { name: "implant", show: ["implant"], occlude: ["newBone", "gumWide"] },
    ],
    parts: graft,
  },
  sinus: {
    size: 2000,
    fov: 20,
    envIntensity: 0.65,
    camera(cam, T) {
      cam.position.set(-34, 16, 104);
      cam.lookAt(new T.Vector3(0, 11.5, 0));
    },
    layers: [
      { name: "maxilla", show: ["maxilla"] },
      { name: "lining-low", show: ["liningLow"], occlude: ["maxilla"] },
      { name: "granules", show: ["granules"], occlude: ["maxilla"] },
      { name: "lining-high", show: ["liningHigh"], occlude: ["maxilla", "granules"] },
      { name: "new-bone", show: ["newBone"], occlude: ["maxilla"] },
      { name: "gum", show: ["gum"], occlude: ["maxilla"] },
      { name: "implant", show: ["implant"], occlude: ["maxilla", "gum", "newBone"] },
    ],
    parts: sinus,
  },
  crown: {
    size: 1600,
    fov: 20,
    envIntensity: 0.6,
    parts(assets, T) {
      const g = crownFromModel(assets.tooth, { scale: 4.7 });
      const cut = [new T.Plane(new T.Vector3(0, 1, 0), -0.47)]; // a crown: everything above the cemento-enamel junction
      const m = (material) => Object.assign(material, { clippingPlanes: cut, side: T.DoubleSide });
      return {
        scan: { geometry: g, material: m(new T.PointsMaterial({ color: 0x2f6ea8, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0.85 })), points: true },
        design: { geometry: g, material: m(new T.MeshStandardMaterial({ color: 0xb9c9d8, roughness: 0.55, metalness: 0 })) },
        ceramic: { geometry: g, material: m(porcelain(T)) },
      };
    },
    camera(cam, T) {
      cam.position.set(-12, 24, 34);
      cam.lookAt(new T.Vector3(0, 3.0, 0));
    },
    layers: [
      { name: "scan", show: ["scan"] },
      { name: "design", show: ["design"] },
      { name: "ceramic", show: ["ceramic"] },
    ],
  },
  shades: {
    size: 2000,
    fov: 18,
    envIntensity: 0.6,
    parts(assets, T) {
      const parts = {};
      const steel = new T.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.9, roughness: 0.35 });
      SHADES.forEach((rgb, i) => {
        const x = (i - 3.5) * 9.4;
        parts[`tab${i}`] = { geometry: tint(tooth({ W: 7.6, H: 10.2, T: 5.2, root: 0.6, ripple: 0.05 }), rgb, 0.85), material: enamel(T), place: (m) => { m.rotation.z = Math.PI; m.position.set(x, 10.8, 0); } };
        parts[`stem${i}`] = { geometry: new T.CylinderGeometry(0.9, 0.9, 12, 32), material: steel, place: (m) => m.position.set(x, 16.6, -0.4) };
      });
      parts.bar = { geometry: new T.BoxGeometry(80, 4.2, 4.2, 1, 1, 1), material: new T.MeshStandardMaterial({ color: 0xe7ebef, roughness: 0.4 }), place: (m) => m.position.set(0, 23.5, -0.4) };
      return parts;
    },
    camera(cam, T) {
      cam.position.set(0, 2, 262);
      cam.lookAt(new T.Vector3(0, 12, 0));
    },
    meta(parts, camera, T) {
      const px = project(camera, T);
      return { tabs: SHADES.map((_, i) => px((i - 3.5) * 9.4, 4.5, 3)) };
    },
    layers: [{ name: "tabs", show: ["*"] }],
  },
};
