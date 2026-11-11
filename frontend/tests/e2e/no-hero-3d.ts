import type { Page } from "@playwright/test";

/**
 * Motion specs that do not test the 3D tooth keep it off: the page reports Save-Data, so the hero stays a poster
 * (tier 0, readCapabilities in tier.ts). Headless Chromium renders WebGL on the CPU, which starves the suite on a
 * busy machine; the 3D itself is covered by hero-3d.spec.ts.
 */
export const withoutHero3d = (page: Page) =>
  page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true, effectiveType: "4g" } }));
