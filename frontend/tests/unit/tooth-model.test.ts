import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { brotliCompressSync } from "node:zlib";
import { decodeTooth, encodeTooth } from "../../src/components/three/hero-tooth/toothFormat.ts";

test("encode → decode round-trips a tiny mesh", () => {
  const mesh = {
    positions: new Int16Array([-32767, 0, 32767, 0, 32767, 0, 32767, -32767, 0]),
    normals: new Int8Array([0, 127, 0, 0, 127, 0, 0, 127, 0]),
    indices: new Uint16Array([0, 1, 2]),
    min: [-1, -2, -3] as [number, number, number],
    max: [1, 2, 3] as [number, number, number],
  };
  const decoded = decodeTooth(encodeTooth(mesh));
  assert.deepEqual([...decoded.positions], [...mesh.positions]);
  assert.deepEqual([...decoded.normals], [...mesh.normals]);
  assert.deepEqual([...decoded.indices], [...mesh.indices]);
  assert.deepEqual(decoded.min, mesh.min);
  assert.deepEqual(decoded.max, mesh.max);
});

test("rejects a file that is not a tooth model", () => {
  assert.throws(() => decodeTooth(new ArrayBuffer(64)), /not a tooth model/);
});

const file = readFileSync(new URL("../../public/models/tooth.bin", import.meta.url));
const tooth = decodeTooth(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));

test("hero tooth stays inside the 3D budget (3D_HERO_MASTER_PLAN §11)", () => {
  assert.ok(tooth.indices.length / 3 <= 30_000, `${tooth.indices.length / 3} triangles > 30k`);
  const wire = brotliCompressSync(file).length;
  assert.ok(wire <= 150 * 1024, `${Math.round(wire / 1024)} KB compressed > 150 KB`);
});

test("hero tooth v2 carries enough detail for the anatomy (D-064)", () => {
  assert.ok(tooth.indices.length / 3 >= 18_000, `${tooth.indices.length / 3} triangles < 18k`);
});

// Vertices in normalized model space: every axis spans [-1, 1] over the bounding box (x mesiodistal,
// y occlusal ↑, z buccolingual).
const vertices = Array.from({ length: tooth.positions.length / 3 }, (_, v) =>
  [0, 1, 2].map((a) => tooth.positions[v * 3 + a] / 32767),
);
const band = (lo: number, hi: number) => vertices.filter(([, y]) => y >= lo && y < hi);
const extent = (vs: number[][], axis: number) => Math.max(...vs.map((v) => Math.abs(v[axis])));

test("anatomy: two separate roots in the apical third", () => {
  const apical = band(-0.85, -0.6);
  assert.ok(apical.some(([x]) => x < -0.15) && apical.some(([x]) => x > 0.15), "a root on each side");
  assert.ok(apical.every(([x]) => Math.abs(x) > 0.1), "no tissue between the roots");
});

test("anatomy: the crown narrows to a cervical neck", () => {
  const crownWidth = extent(band(0.45, 0.6), 0); // height of contour
  const neckWidth = extent(band(0.1, 0.18), 0); // cemento-enamel junction
  assert.ok(neckWidth < crownWidth * 0.85, `neck ${neckWidth.toFixed(2)} vs crown ${crownWidth.toFixed(2)}`);
});

test("anatomy: cusps rise above a central fossa", () => {
  const top = Math.max(...vertices.map(([, y]) => y));
  const centre = Math.max(...vertices.filter(([x, , z]) => Math.abs(x) < 0.1 && Math.abs(z) < 0.1).map(([, y]) => y));
  assert.ok(top - centre > 0.06, `fossa depth ${(top - centre).toFixed(3)}`);
});

test("hero tooth is a tall, upright molar with valid indices", () => {
  const [w, h, d] = [0, 1, 2].map((i) => tooth.max[i] - tooth.min[i]);
  assert.ok(h > w && h > d, `height ${h.toFixed(2)} should exceed width ${w.toFixed(2)} and depth ${d.toFixed(2)}`);
  const vertices = tooth.positions.length / 3;
  assert.ok(tooth.indices.every((i) => i < vertices));
});

for (const poster of ["tooth-scan", "tooth-poster"]) {
  test(`poster ${poster} (scan start / finished tooth, D-065) exists as a 1000×1000 PNG`, () => {
    const png = readFileSync(new URL(`../../public/images/hero/${poster}.png`, import.meta.url));
    assert.equal(png.toString("latin1", 1, 4), "PNG");
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1000, 1000]);
  });
}
