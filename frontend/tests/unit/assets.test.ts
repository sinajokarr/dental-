import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

// Every photo shipped under public/images/cities has its source and licence recorded (PROJECT_BRIEF §8).
test("each city photo is listed in docs/ASSET_LICENSES.md", () => {
  const licences = readFileSync(new URL("../../../docs/ASSET_LICENSES.md", import.meta.url), "utf8");
  const photos = readdirSync(new URL("../../public/images/cities/", import.meta.url)).filter((f) => /\.(jpe?g|png|webp|avif)$/.test(f));
  assert.ok(photos.length >= 2, "two city photos");
  for (const photo of photos) assert.ok(licences.includes(`images/cities/${photo}`), `${photo} missing from ASSET_LICENSES.md`);
});
