import { expect, test } from "@playwright/test";

test("consultation section (#consultation) explains the next three steps and offers WhatsApp", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section#consultation");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Begin with a free consultation");
  await expect(section.locator("ol > li")).toHaveCount(3);
  await expect(section.getByRole("link", { name: "Chat on WhatsApp" })).toBeVisible();
});

test("consultation section also offers a phone call to the same number", async ({ page }) => {
  await page.goto("/de");
  const call = page.locator("section#consultation").getByRole("link", { name: "+90 542 713 01 32" });
  await expect(call).toHaveAttribute("href", "tel:+905427130132");
});

test("footer: WhatsApp and a call link with the number isolated LTR, legal and language links on every locale", async ({ page }) => {
  await page.goto("/fa");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "+90 542 713 01 32" })).toHaveAttribute("href", "tel:+905427130132");
  await expect(footer.locator("a[href^='tel:'] bdi[dir=ltr]")).toHaveText("+90 542 713 01 32");
  expect(await footer.getByRole("link", { name: "واتس‌اپ" }).getAttribute("href")).toMatch(/^https:\/\/wa\.me\/905427130132/);
  await expect(footer.getByRole("link", { name: "حریم خصوصی" })).toHaveAttribute("href", "/fa/privacy");
  await expect(footer.getByRole("link", { name: "Deutsch" })).toHaveAttribute("href", "/de");
});

test("mobile sticky CTA appears after the hero and hides at the consultation section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tr");
  const bar = page.locator("[data-sticky-cta]");
  await expect(bar).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(bar).toBeVisible();
  await page.locator("#consultation").scrollIntoViewIfNeeded();
  await expect(bar).toBeHidden();
});

test("no sticky CTA on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(page.locator("[data-sticky-cta]")).toBeHidden();
});
