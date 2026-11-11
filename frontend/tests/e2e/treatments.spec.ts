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

test("cards reveal when scrolled into view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en");
  const card = page.locator("[data-treatment-card]").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-revealed", "");
  await expect(card).toHaveCSS("opacity", "1");
});

test("with reduced motion all cards are visible without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fa");
  await expect(page.locator("[data-treatment-card]")).toHaveCount(3);
  for (const card of await page.locator("[data-treatment-card]").all()) await expect(card).toHaveCSS("opacity", "1");
});
