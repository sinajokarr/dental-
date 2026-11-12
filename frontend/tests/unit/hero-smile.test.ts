import assert from "node:assert/strict";
import { test } from "node:test";
import { CURVE, VIEWBOX, curveAt, toothPath, teeth } from "../../src/components/sections/hero-smile/geometry.ts";

const MID = (CURVE.x0 + CURVE.x1) / 2;
const DISC = { cx: VIEWBOX / 2, cy: VIEWBOX / 2, r: 282 }; // the medallion drawn by HeroSmile.tsx

test("the curve is a symmetric smile: lowest in the middle, rising to both ends", () => {
  assert.equal(curveAt(0).y, CURVE.y0);
  assert.equal(curveAt(1).y, CURVE.y1);
  assert.ok(Math.abs(curveAt(0.5).slope) < 1e-9);
  assert.ok(curveAt(0.5).y > CURVE.y0, "the middle hangs lower than the ends");
  assert.ok(Math.abs(curveAt(0.3).y - curveAt(0.7).y) < 1e-9);
});

test("eight front teeth, four per side, the central pair drawn last (on top)", () => {
  const set = teeth();
  assert.equal(set.length, 8);
  assert.deepEqual(set.map((t) => t.index), [3, 3, 2, 2, 1, 1, 0, 0]);
  assert.deepEqual(set.map((t) => t.kind).slice(-2), ["central", "central"]);
});

test("teeth mirror each other across the midline", () => {
  const set = teeth();
  for (const t of set) {
    const twin = set.find((o) => o !== t && o.index === t.index && Math.abs(o.x - (2 * MID - t.x)) < 0.11);
    assert.ok(twin, `tooth at x=${t.x} has a mirror twin`);
    assert.ok(Math.abs(twin.y - t.y) < 0.11);
    assert.ok(Math.abs(twin.angle + t.angle) < 0.11, "the lean mirrors too");
  }
});

test("every tooth sits on the smile line (its incisal edge is on the curve) and leans with the arch", () => {
  for (const t of teeth()) {
    const on = curveAt((t.x - CURVE.x0) / (CURVE.x1 - CURVE.x0));
    assert.ok(Math.abs(on.y - t.y) < 0.11, `tooth at x=${t.x} rests on the curve`);
    if (t.x < MID - 1) assert.ok(t.angle > 0, "left teeth lean towards the midline");
    if (t.x > MID + 1) assert.ok(t.angle < 0, "right teeth lean towards the midline");
    assert.ok(Math.abs(t.angle) < 20, "never a fan of planks");
  }
});

test("neighbours touch with a hair of overlap — no gap, no collision", () => {
  const side = teeth().filter((t) => t.x > MID).sort((a, b) => a.x - b.x);
  for (let i = 1; i < side.length; i++) {
    const ratio = (side[i].x - side[i - 1].x) / ((side[i].width + side[i - 1].width) / 2);
    assert.ok(ratio > 0.9 && ratio < 1, `neighbours ${i - 1}/${i}: spacing ratio ${ratio.toFixed(3)}`);
  }
});

test("proportions are anatomical: central incisors widest, premolars narrowest", () => {
  const byKind = Object.fromEntries(teeth().map((t) => [t.kind, t]));
  assert.ok(byKind.central.width > byKind.lateral.width && byKind.central.width > byKind.canine.width);
  assert.ok(byKind.premolar.width < byKind.lateral.width);
  assert.ok(byKind.central.height > byKind.lateral.height);
});

test("the whole smile stays inside the medallion", () => {
  const inside = (x: number, y: number) => Math.hypot(x - DISC.cx, y - DISC.cy) < DISC.r - 8;
  assert.ok(inside(CURVE.x0, CURVE.y0) && inside(CURVE.x1, CURVE.y1), "the line's ends");
  for (const t of teeth()) {
    const rad = (t.angle * Math.PI) / 180;
    const top = { x: t.x + Math.sin(rad) * t.height * 1.08, y: t.y - Math.cos(rad) * t.height * 1.08 };
    assert.ok(inside(top.x, top.y), `top of the tooth at x=${t.x}`);
    assert.ok(inside(t.x, t.y), `edge of the tooth at x=${t.x}`);
  }
});

test("tooth outlines are closed, finite paths for every kind", () => {
  for (const kind of ["central", "lateral", "canine", "premolar"] as const) {
    const d = toothPath(kind, 60, 100);
    assert.ok(d.startsWith("M") && d.endsWith("Z"), kind);
    assert.ok(!/NaN|Infinity/.test(d), kind);
  }
});
