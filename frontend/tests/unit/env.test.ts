import assert from "node:assert/strict";
import { test } from "node:test";

test("next.config refuses to load without NEXT_PUBLIC_SITE_URL and names it", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "";
  await assert.rejects(import("../../next.config.ts"), /Missing required environment variable: NEXT_PUBLIC_SITE_URL/);
});

test("next.config refuses a site URL that is not an absolute http(s) origin", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "localhost:3000"; // no scheme: canonical, hreflang and sitemap URLs would break
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "905427130132";
  const fresh = "../../next.config.ts?bad-url"; // a new module instance: the first import above is cached
  await assert.rejects(import(fresh), /NEXT_PUBLIC_SITE_URL must be an absolute http\(s\) origin/);
});
