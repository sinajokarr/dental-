// The three treatment renders (D-081). Each job lists its parts (geometry + physically based material), one camera shared
// by every layer of that job (so the layers stack exactly), and the layers to export.
import { abutment, archGum, crownFromModel, fixture, gum, tooth, toothGum, toothSection, veneerShell } from "/geometry.js";

const titanium = (T) => new T.MeshStandardMaterial({ color: 0xc3c7cc, metalness: 1, roughness: 0.3 });
const anodized = (T) => new T.MeshStandardMaterial({ color: 0xd6bf8c, metalness: 1, roughness: 0.27, side: T.DoubleSide });
const gingiva = (T) => new T.MeshPhysicalMaterial({ color: 0xd48f8a, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.35, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new T.Color(0xffb9b2), side: T.DoubleSide });
const enamel = (T) => new T.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.24, clearcoat: 0.75, clearcoatRoughness: 0.14, sheen: 0.28, sheenRoughness: 0.45, sheenColor: new T.Color(0xfff2e0) });
const veneerPorcelain = (T) => new T.MeshPhysicalMaterial({ transparent: true, opacity: 0.88, color: 0xf3f7fb, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.25, sheenColor: new T.Color(0xfff6ea), ior: 1.52, side: T.DoubleSide });
const porcelain = (T) => new T.MeshPhysicalMaterial({ color: 0xf7f2ea, roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.1, sheen: 0.3, sheenRoughness: 0.4, sheenColor: new T.Color(0xfff4e6), ior: 1.5 });

function orbit(cam, T, { target, distance, yaw, pitch }) {
  cam.position.set(target[0] + distance * Math.sin(yaw) * Math.cos(pitch), target[1] + distance * Math.sin(pitch), target[2] + distance * Math.cos(yaw) * Math.cos(pitch));
  cam.lookAt(new T.Vector3(...target));
}

export const JOBS = {
  implant: {
    size: 2000,
    fov: 20,
    parts(assets, T) {
      const FIX = 10.5;
      const cutY = FIX + 1.35; // the crown's margin meets the gingival margin: the abutment is covered, as in the final restoration
      const crownMaterial = porcelain(T);
      crownMaterial.clippingPlanes = [new T.Plane(new T.Vector3(0, 1, 0), -cutY)];
      crownMaterial.side = T.DoubleSide;
      return {
        fixture: { geometry: fixture({ length: FIX }), material: titanium(T) },
        abutment: { geometry: abutment(), material: anodized(T), place: (m) => m.position.set(0, FIX, 0) },
        gum: { geometry: gum(), material: gingiva(T), place: (m) => m.position.set(0, FIX, 0) },
        crown: { geometry: crownFromModel(assets.tooth, { scale: 4.7 }), material: crownMaterial, place: (m) => m.position.set(0, cutY - 0.1 * 4.7, 0) },
      };
    },
    camera(cam, T) {
      orbit(cam, T, { target: [0, 8.8, 0], distance: 60, yaw: -0.38, pitch: 0.2 });
    },
    // Stack order, back to front: fixture < abutment < gum < crown. Each layer only hides what is in front of it.
    meta(parts, camera, T) {
      const px = (x, y, z) => { const p = new T.Vector3(x, y, z).project(camera); return [Math.round(((p.x + 1) / 2) * 10000) / 10, Math.round(((1 - p.y) / 2) * 10000) / 10]; };
      const FIX = 10.5;
      return { axis: px(0, 0, 0)[0], fixtureBottom: px(0, 0, 0)[1], platform: px(0, FIX, 0)[1], crownMargin: px(0, FIX + 1.35, 4.2)[1], crownTop: px(0, FIX + 1.35 + 4.2, 0)[1], width: [px(-4.3, FIX + 3, 0)[0], px(4.3, FIX + 3, 0)[0]] };
    },
    layers: [
      { name: "fixture", show: ["fixture"] },
      { name: "abutment", show: ["abutment"] },
      { name: "gum", show: ["gum"], occlude: ["abutment", "fixture"] },
      { name: "crown", show: ["crown"], occlude: ["gum"] },
    ],
  },
  veneers: {
    size: 2000,
    fov: 20,
    envIntensity: 0.5,
    key: 3.4,
    fill: 0.35,
    rim: 1.1,
    parts(assets, T) {
      const o = { W: 8.7, H: 10.8, T: 7, root: 10, ripple: 0.08 };
      const shellGeometries = veneerShell(o);
      return {
        tooth: { geometry: tooth(o), material: enamel(T) },
        gum: { geometry: toothGum({ ...o, gumBottom: -4.2 }), material: gingiva(T) },
        // The shell is several geometries (two sheets + edge strips) merged into one mesh group below.
        shell: { geometry: shellGeometries, material: veneerPorcelain(T) },
      };
    },
    camera(cam, T) {
      orbit(cam, T, { target: [0, 1.6, 0], distance: 84, yaw: -0.5, pitch: 0.1 });
    },
    meta(parts, camera, T) {
      const px = (x, y, z) => { const p = new T.Vector3(x, y, z).project(camera); return [Math.round(((p.x + 1) / 2) * 10000) / 10, Math.round(((1 - p.y) / 2) * 10000) / 10]; };
      return { shellCentre: px(0, 5.5, 4.6), toothTop: px(0, 10.8, 1.5), gumMargin: px(0, 0.3, 4) };
    },
    layers: [
      { name: "tooth", show: ["tooth"] },
      { name: "gum", show: ["gum"], occlude: ["tooth"] },
      { name: "shell", show: ["shell"] },
    ],
  },
  smile: {
    size: 2000,
    fov: 17,
    envIntensity: 0.55,
    key: 3.2,
    fill: 0.4,
    rim: 0.9,
    parts(assets, T) {
      const R = 25;
      // From the midline outwards: central incisor, lateral incisor, canine, first premolar. Slightly different, never mirrored exactly.
      const specs = [
        { W: 8.7, H: 10.8, T: 6.8, root: 1.4, ripple: 0.08, edge: 0 },
        { W: 6.7, H: 9.0, T: 6.2, root: 1.4, ripple: 0.07, edge: 0.9 },
        { W: 7.7, H: 10.2, T: 8.0, root: 1.4, ripple: 0.0, cusp: 0.9, edge: -0.2 },
        { W: 6.9, H: 8.2, T: 8.8, root: 1.4, ripple: 0.0, cusp: 0.5, edge: 1.3 },
      ];
      const sides = { right: 1, left: -1 };
      // Real mouths are not mirror images: small, deliberate differences per side.
      const jitter = { right: { scaleW: 1.0, scaleH: 1.0, tilt: 0.0 }, left: { scaleW: 0.97, scaleH: 0.96, tilt: 0.04 } };
      const parts = {};
      const teethMeta = [];
      let s0 = 0;
      const arcStart = specs.map((sp) => { const mid = s0 + sp.W / 2; s0 += sp.W * 0.985; return mid; });
      const alphaMax = (s0 + 1.5) / R;
      for (const [side, sign] of Object.entries(sides)) {
        specs.forEach((sp, k) => {
          const j = jitter[side];
          const o = { ...sp, W: sp.W * j.scaleW, H: sp.H * j.scaleH };
          const alpha = (sign * arcStart[k]) / R;
          const id = `${side}${k}`;
          const yInc = sp.edge - (side === "left" && k === 1 ? 0.5 : 0);
          const place = (m) => {
            const wrap = new T.Group();
            wrap.position.set(R * Math.sin(alpha), yInc + o.H, -R * (1 - Math.cos(alpha)));
            wrap.rotation.y = alpha;
            m.rotation.z = Math.PI + j.tilt * (k === 0 ? 1 : 0.4) * sign;
            return wrap;
          };
          parts[id] = { geometry: tooth(o), material: enamel(T), group: place, meta: { side, k, alpha, o, yInc } };
          teethMeta.push(parts[id].meta);
        });
      }
      // Gingival margin: zeniths at the labial centre of every crown, papillae (lower) between them.
      const centres = teethMeta.map((m) => ({ a: (m.side === "right" ? 1 : -1) * arcStart[m.k] / R, y: m.yInc + m.o.H + 0.25 })).sort((p, q) => p.a - q.a);
      const edge = (al) => {
        if (al <= centres[0].a) return centres[0].y;
        if (al >= centres[centres.length - 1].a) return centres[centres.length - 1].y;
        let i = 0;
        while (centres[i + 1].a < al) i++;
        const t = (al - centres[i].a) / (centres[i + 1].a - centres[i].a);
        return centres[i].y + (centres[i + 1].y - centres[i].y) * t - 2.3 * Math.pow(Math.sin(Math.PI * t), 1.5);
      };
      const fade = (() => {
        const c = document.createElement("canvas");
        c.width = 4; c.height = 256;
        const x = c.getContext("2d");
        const g = x.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, "#000"); g.addColorStop(0.55, "#fff"); g.addColorStop(1, "#fff");
        x.fillStyle = g; x.fillRect(0, 0, 4, 256);
        return new T.CanvasTexture(c);
      })();
      const plateMaterial = gingiva(T);
      plateMaterial.transparent = true; plateMaterial.alphaMap = fade; plateMaterial.depthWrite = true;
      parts.plate = { geometry: archGum({ R, alpha: alphaMax + 0.1, edge }), material: plateMaterial };
      return parts;
    },
    camera(cam, T) {
      cam.position.set(0, 9, 232);
      cam.lookAt(new T.Vector3(0, 11.5, -2));
    },
    layers: [
      { name: "arch", show: ["*"] },
    ],
    // Projected key points (1000 px space) so the SVG guides line up with the render exactly.
    meta(parts, camera, T) {
      const px = (v) => { const p = v.clone().project(camera); return [Math.round(((p.x + 1) / 2) * 1000 * 10) / 10, Math.round(((1 - p.y) / 2) * 1000 * 10) / 10]; };
      const out = [];
      for (const [id, wrap] of Object.entries(parts)) {
        if (id === "plate") continue;
        const m = wrap.children[0];
        const o = m.userData.opts ?? m.geometry.userData.opts;
        wrap.updateMatrixWorld(true);
        const at = (x, y, z) => px(new T.Vector3(x, y, z).applyMatrix4(m.matrixWorld));
        const sec = (y) => toothSection(y, o);
        const hi = sec(o.H * 0.97), mid = sec(o.H * 0.55), lo = sec(0);
        out.push({
          id,
          incisal: at(0, o.H, hi.zc + hi.b),
          left: at(-mid.a, o.H * 0.55, mid.zc),
          right: at(mid.a, o.H * 0.55, mid.zc),
          edgeLeft: at(-hi.a, o.H * 0.9, hi.zc),
          edgeRight: at(hi.a, o.H * 0.9, hi.zc),
          zenith: at(0, 0.2, lo.zc + lo.b),
        });
      }
      out.sort((p, q) => p.incisal[0] - q.incisal[0]);
      return { teeth: out };
    },
  },
};
