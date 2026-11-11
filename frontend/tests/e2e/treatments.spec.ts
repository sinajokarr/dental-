import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" }); // exercises motion and the WebGL hero

test("trust strip lists only the five verified facts", async ({ page }) => {
  await page.goto("/en");
  const items = page.getByRole("list", { name: "At a glance" }).getByRole("listitem");
  await expect(items).toHaveText([
    "Free initial consultation",
    "Antalya & Istanbul",
    "Hotel & airport transfer",
    "Interpreter support",
    "Treatment packages",
  ]);
});

test("each treatment card is one link (one tab stop) to its localized page", async ({ page }) => {
  await page.goto("/de");
  const section = page.locator("section[aria-labelledby=treatments-title]");
  const links = section.getByRole("link");
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute("href", "/de/zahnimplantate");
  await expect(links.nth(1)).toHaveAttribute("href", "/de/veneers");
  await expect(links.nth(2)).toHaveAttribute("href", "/de/smile-design");
});

test("treatments are chapters, not a numbered sequence", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=treatments-title]");
  await expect(section.locator("[data-treatment-card]")).toHaveCount(3);
  await expect(section).not.toContainText(/0[1-3]/);
});

const dashOffset = (path: import("@playwright/test").Locator) =>
  path.evaluate((p) => parseFloat(getComputedStyle(p).strokeDashoffset) || 0);

test("each chapter's line drawing draws itself as it scrolls into view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en");
  const drawing = page.locator("[data-draw]").nth(2);
  const firstLine = drawing.locator("[pathLength]").first();
  expect(await dashOffset(firstLine)).toBeGreaterThan(0.5); // far below the fold: not drawn yet
  await drawing.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect.poll(() => dashOffset(firstLine)).toBeLessThan(0.05);
});

test("with reduced motion every chapter and drawing is complete and still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fa");
  await expect(page.locator("[data-treatment-card]")).toHaveCount(3);
  const lines = page.locator("[data-draw] [pathLength]");
  expect(await lines.count()).toBeGreaterThan(12);
  for (const line of await lines.all()) expect(await dashOffset(line)).toBe(0);
});
