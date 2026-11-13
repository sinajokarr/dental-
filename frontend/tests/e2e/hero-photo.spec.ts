import { expect, test } from "@playwright/test";

// The hero photograph (D-088) as an editorial split (D-089): full height, flush with the screen edge on desktop; a print on phones.
const root = "[data-hero-photo]";

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("one short pass (fade in from a slow push), opacity and scale only, then rest", async ({ page }) => {
    await page.goto("/en");
    const list = await page.evaluate(() =>
      document.querySelector("[data-hero-photo]")!.getAnimations({ subtree: true }).map((a) => ({
        end: a.effect!.getComputedTiming().endTime as number,
        infinite: a.effect!.getComputedTiming().iterations === Infinity,
        properties: [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((f) => Object.keys(f)))].filter((k) => !["offset", "computedOffset", "easing", "composite"].includes(k)),
      })),
    );
    expect(list.length).toBe(2);
    expect(Math.max(...list.map((a) => a.end))).toBeLessThanOrEqual(2500);
    expect(list.some((a) => a.infinite)).toBe(false);
    expect(new Set(list.flatMap((a) => a.properties))).toEqual(new Set(["opacity", "scale"]));
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the finished photograph, nothing moves", async ({ page }) => {
    await page.goto("/en");
    expect(await page.locator(root).evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.locator(`${root} img`).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test("desktop: full hero height, flush with the inline-end edge (right in LTR, left in RTL), clear of the words", async ({ page }) => {
  for (const [locale, width] of [["en", 1440], ["fa", 1440], ["de", 1024]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/${locale}`);
    const photo = (await page.locator(root).boundingBox())!;
    const hero = (await page.locator("section[aria-labelledby=hero-title]").boundingBox())!;
    const title = (await page.locator("#hero-title").boundingBox())!;
    expect(Math.abs(photo.height - hero.height), `${locale}@${width} height`).toBeLessThanOrEqual(1);
    if (locale === "fa") {
      expect(photo.x, "flush left in RTL").toBeLessThanOrEqual(1);
      expect(photo.x + photo.width, "clear of the words").toBeLessThanOrEqual(title.x + 1);
    } else {
      expect(Math.abs(photo.x + photo.width - width), "flush right in LTR").toBeLessThanOrEqual(1);
      expect(photo.x, "clear of the words").toBeGreaterThanOrEqual(title.x + title.width - 1);
    }
  }
});

test("phones: a full-width print below both calls to action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const photo = (await page.locator(root).boundingBox())!;
  const whatsapp = (await page.locator("section[aria-labelledby=hero-title] a[href^='https://wa.me/']").boundingBox())!;
  expect(photo.y).toBeGreaterThan(whatsapp.y + whatsapp.height);
  expect(photo.width).toBeGreaterThan(330);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("decorative and fast: empty alt, hidden from assistive technology, eager high-priority image, no video, no canvas", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(`${root} img`)).toHaveCount(1);
  await expect(page.locator(`${root} img`)).toHaveAttribute("alt", "");
  await expect(page.locator(root)).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(`${root} img`)).toHaveAttribute("fetchpriority", "high");
  await expect(page.locator(`${root} video, ${root} canvas`)).toHaveCount(0);
  expect(await page.locator(`${root} img`).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test("without JavaScript the photograph is in the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator(`${root} img`)).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});
