import { defineConfig, devices } from "@playwright/test";

// H05 — the end-to-end suite against a running production stack (Caddy → Next standalone → Django → PostgreSQL):
//   E2E_BASE_URL=https://localhost:8443 npx playwright test -c playwright.prod.config.ts
// Specs that need the contract mock's scripted failures (form.spec, form-resilience.spec) run only against the
// mock (playwright.config.ts); here the form goes to the real API, so the throttle (10/h per IP) allows a few sends.
export default defineConfig({
  testDir: "tests/e2e",
  testIgnore: ["form.spec.ts", "form-resilience.spec.ts"],
  workers: 2,
  expect: { timeout: 10_000 },
  use: { baseURL: process.env.E2E_BASE_URL ?? "https://localhost:8443", ignoreHTTPSErrors: true, reducedMotion: "reduce" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
