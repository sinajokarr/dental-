import assert from "node:assert/strict";
import { test } from "node:test";
import { gsap } from "gsap";
import { buildEntrance, ENTRANCE_START, ENTRANCE_FINAL } from "../../src/components/three/hero-tooth/entrance.ts";

test("the scan entrance ends within 5 s of the reveal (WCAG 2.2.2, D-041)", () => {
  const motion = { ...ENTRANCE_START, sweepX: -3.2, sweepI: 0, float: 0 };
  const timeline = buildEntrance(gsap, motion, () => {}, () => {});
  assert.ok(timeline.delay() + timeline.totalDuration() <= 5, `${(timeline.delay() + timeline.totalDuration()).toFixed(2)} s`);
  timeline.kill();
});

test("the scan entrance lands exactly on the finished-tooth pose of the final poster", () => {
  const motion = { ...ENTRANCE_START, sweepX: -3.2, sweepI: 0, float: 0 };
  const timeline = buildEntrance(gsap, motion, () => {}, () => {});
  timeline.progress(1);
  for (const key of Object.keys(ENTRANCE_FINAL) as (keyof typeof ENTRANCE_FINAL)[]) {
    assert.equal(motion[key], ENTRANCE_FINAL[key], key);
  }
  assert.equal(motion.sweepI, 0, "the glint is off at rest");
  timeline.kill();
});
