import { expect, test } from "@playwright/test";
import { withoutHero3d } from "./no-hero-3d";

test.use({ reducedMotion: "no-preference" }); // exercises motion
test.beforeEach(({ page }) => withoutHero3d(page)); // …but not the WebGL hero (hero-3d.spec.ts)

test("hero heading and both CTAs are visible without scrolling on a 390×844 phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const hero = page.locator("section[aria-labelledby=hero-title]");
  await expect(hero.getByRole("heading", { level: 1 })).toContainText("smile");
  for (const name of ["Request a free consultation", "Chat on WhatsApp"]) {
    const cta = hero.getByRole("link", { name });
    await expect(cta).toBeVisible();
    expect((await cta.boundingBox())!.y + (await cta.boundingBox())!.height).toBeLessThanOrEqual(844);
  }
});

test("hero CTAs: consultation anchors in-page, WhatsApp opens the clinic chat", async ({ page }) => {
  await page.goto("/tr");
  const hero = page.locator("section[aria-labelledby=hero-title]");
  await expect(hero.getByRole("link", { name: "Ücretsiz danışmanlık talep edin" })).toHaveAttribute("href", "#consultation");
  const wa = await hero.getByRole("link", { name: "WhatsApp'tan yazın" }).getAttribute("href");
  expect(decodeURIComponent(wa!)).toContain("wa.me/905427130132?text=Merhaba JOKAR DENTAL");
});

test("hero renders fully without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/fa");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "درخواست مشاوره رایگان" })).toBeVisible();
  await context.close();
});

test("hero load causes no layout shift (CLS 0)", async ({ page }) => {
  await page.goto("/en");
  await page.waitForTimeout(1500); // fonts, hydration, entrance animations
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEntry[] & { value: number; hadRecentInput: boolean }[])
            if (!entry.hadRecentInput) total += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(total), 100);
      }),
  );
  expect(cls).toBeLessThan(0.01);
});

test("with reduced motion the hero words do not animate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/de");
  const name = await page.locator(".hero-word").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("none");
});

test("mobile header shows no consultation button (the hero and menu carry it)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fa");
  await expect(page.getByRole("banner").getByRole("link", { name: "مشاوره رایگان" })).toBeHidden();
});

test("punctuation after emphasis stays on the same line as its word; Persian emphasis is coloured, not italic", async ({ page }) => {
  await page.goto("/fa");
  const words = await page.locator(".hero-word").allTextContents();
  expect(words).not.toContain("،");
  expect(words.some((w) => w.endsWith("شما،"))).toBe(true);
  const em = page.locator("#hero-title em");
  expect(await em.first().evaluate((el) => getComputedStyle(el).fontStyle)).toBe("normal");
  expect(await em.first().evaluate((el) => getComputedStyle(el).color)).toBe("rgb(12, 87, 152)");
});
