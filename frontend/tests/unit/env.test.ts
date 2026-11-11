import assert from "node:assert/strict";
import { test } from "node:test";

test("next.config refuses to load without NEXT_PUBLIC_SITE_URL and names it", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "";
  await assert.rejects(import("../../next.config.ts"), /Missing required environment variable: NEXT_PUBLIC_SITE_URL/);
});
