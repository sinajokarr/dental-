import assert from "node:assert/strict";
import { test } from "node:test";
import { detectTier, type Capabilities } from "../../src/components/three/hero-tooth/tier.ts";

const desktop: Capabilities = { reducedMotion: false, saveData: false, webgl2: true, deviceMemory: 8, effectiveType: "4g", finePointer: true, wide: true };

test("capable desktop → Tier 2 (full material)", () => assert.equal(detectTier(desktop), 2));
test("touch or narrow screen → Tier 1 (light material)", () => {
  assert.equal(detectTier({ ...desktop, finePointer: false }), 1);
  assert.equal(detectTier({ ...desktop, wide: false }), 1);
});
test("poster only (Tier 0) for reduced motion, data saver, no WebGL2, < 4 GB, slow networks", () => {
  for (const change of [{ reducedMotion: true }, { saveData: true }, { webgl2: false }, { deviceMemory: 2 }, { effectiveType: "3g" }, { effectiveType: "slow-2g" }]) {
    assert.equal(detectTier({ ...desktop, ...change }), 0, JSON.stringify(change));
  }
});
test("unknown device memory and network (Safari, Firefox) do not demote", () => {
  assert.equal(detectTier({ ...desktop, deviceMemory: undefined, effectiveType: undefined }), 2);
});
