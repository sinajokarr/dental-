import { defineConfig, devices } from "@playwright/test";

const PORT = 3100; // not 3000, so a running `npm run dev` never collides
const MOCK_API_PORT = 3199; // tests/e2e/form.spec.ts reads recorded requests from it
const E2E_TOKEN = "e2e-internal-token";

export default defineConfig({
  testDir: "tests/e2e",
  // Headless Chromium renders the hero WebGL on the CPU (SwiftShader): cap parallelism and allow slower
  // assertions so the suite stays deterministic under load (it flaked at 4 workers / 5 s).
  workers: 2,
  expect: { timeout: 10_000 },
  // Default reduced motion: no WebGL hero in tests that do not need it (less CPU, deterministic).
  // Motion-specific files opt back in with test.use({ reducedMotion: "no-preference" }).
  use: { baseURL: `http://localhost:${PORT}`, reducedMotion: "reduce" },
  // Every spec runs in Chromium; the cross-engine and phone smoke (cross-browser.spec.ts) also runs in Firefox,
  // WebKit (Safari), an iPhone and an Android phone (SECURITY_PERFORMANCE_QA §5 matrix, emulated).
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testMatch: /cross-browser\.spec\.ts/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testMatch: /cross-browser\.spec\.ts/ },
    { name: "iphone", use: { ...devices["iPhone 13"] }, testMatch: /cross-browser\.spec\.ts/ },
    { name: "android", use: { ...devices["Pixel 7"] }, testMatch: /cross-browser\.spec\.ts/ },
  ],
  // The Server Action talks to a contract mock of the Django lead API (tests/e2e/mock-lead-api.mjs), so every
  // outcome — success, field errors, 429, 500, timeout — is deterministic. The real API has its own Django tests.
  webServer: [
    {
      command: "node tests/e2e/mock-lead-api.mjs",
      url: `http://127.0.0.1:${MOCK_API_PORT}/api/v1/health/`,
      env: { INTERNAL_API_TOKEN: E2E_TOKEN, MOCK_API_PORT: String(MOCK_API_PORT) },
    },
    {
      command: `npm run build && npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}/en`,
      timeout: 180_000,
      env: { LEAD_API_URL: `http://127.0.0.1:${MOCK_API_PORT}/api/v1/leads/`, INTERNAL_API_TOKEN: E2E_TOKEN },
    },
  ],
});
