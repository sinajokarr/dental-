import { defineConfig, devices } from "@playwright/test";

const PORT = 3100; // not 3000, so a running `npm run dev` never collides

export default defineConfig({
  testDir: "tests/e2e",
  // Headless Chromium renders the hero WebGL on the CPU (SwiftShader): cap parallelism and allow slower
  // assertions so the suite stays deterministic under load (it flaked at 4 workers / 5 s).
  workers: 2,
  expect: { timeout: 10_000 },
  use: { baseURL: `http://localhost:${PORT}` },
  // WebKit and Firefox join in phase H (device/browser matrix).
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    timeout: 180_000,
  },
});
