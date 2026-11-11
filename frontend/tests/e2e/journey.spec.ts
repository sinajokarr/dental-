import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" }); // exercises motion and the WebGL hero

test("international journey: navy section with five ordered steps and an international WhatsApp message", async ({ page }) => {
  await page.goto("/de");
  const section = page.locator("section[aria-labelledby=journey-title]");
  await expect(section).toHaveCSS("background-color", "rgb(9, 42, 74)");
  await expect(section.locator("ol > li")).toHaveCount(5);
  const wa = await section.getByRole("link", { name: "Per WhatsApp schreiben" }).getAttribute("href");
  expect(decodeURIComponent(wa!)).toContain("ich lebe im Ausland");
  await expect(section.getByRole("link", { name: "Mit einer kostenlosen Beratung beginnen" })).toHaveAttribute("href", "#consultation");
});

test("with reduced motion the journey line is fully drawn and every step is active", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fa");
  for (const line of await page.locator("[data-journey-line]").all()) await expect(line).toHaveCSS("transform", "none");
  await expect(page.locator("[data-journey-step]:not([data-pending])")).toHaveCount(5);
});

test("the line draws as the steps scroll into view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  const list = page.locator("section[aria-labelledby=journey-title] ol");
  await list.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 900);
  await expect(page.locator("[data-journey-step][data-pending]")).toHaveCount(0, { timeout: 5000 });
});
