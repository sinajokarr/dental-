import { expect, test } from "@playwright/test";
import { withoutHero3d } from "./no-hero-3d";

test.use({ reducedMotion: "no-preference" }); // exercises motion
test.beforeEach(({ page }) => withoutHero3d(page)); // …but not the WebGL hero (hero-3d.spec.ts)

test("international journey: navy section with five ordered steps and an international WhatsApp message", async ({ page }) => {
  await page.goto("/de");
  const section = page.locator("section[aria-labelledby=journey-title]");
  await expect(section).toHaveCSS("background-color", "rgb(9, 42, 74)");
  await expect(section.locator("ol > li")).toHaveCount(5);
  const wa = await section.getByRole("link", { name: "Per WhatsApp schreiben" }).getAttribute("href");
  expect(decodeURIComponent(wa!)).toContain("ich lebe im Ausland");
  await expect(section.getByRole("link", { name: "Mit einer kostenlosen Beratung beginnen" })).toHaveAttribute("href", "#consultation");
});

const opacity = (el: import("@playwright/test").Locator) => el.evaluate((node) => Number(getComputedStyle(node).opacity));

test("with reduced motion the journey line is fully drawn and every step is lit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fa");
  for (const line of await page.locator("[data-journey-line]").all()) await expect(line).toHaveCSS("translate", "none");
  for (const step of await page.locator("[data-journey-step]").all()) expect(await opacity(step)).toBe(1);
});

test("the line runs and the steps light up in turn as the journey scrolls by", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  const last = page.locator("[data-journey-step]").last();
  expect(await opacity(last)).toBeLessThan(0.6); // not reached yet
  await page.locator("section[aria-labelledby=journey-title] ol").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect.poll(() => opacity(last)).toBe(1);
});

test("the navy panel opens from an inset card to full bleed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=journey-title]");
  const clip = () => section.evaluate((el) => getComputedStyle(el).clipPath);
  await section.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight + 60, behavior: "instant" }));
  await expect.poll(clip).toMatch(/inset\(.*round/);
  await section.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
  // Full bleed: every inset (and the corner radius) is zero, however the browser serializes it.
  await expect.poll(async () => (await clip()).match(/-?[\d.]+/g)?.every((n) => Number(n) === 0) ?? true).toBe(true);
});
