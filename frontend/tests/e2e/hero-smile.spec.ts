import { expect, test, type Page } from "@playwright/test";

// The hero's Signature Smile (D-076): inline SVG, CSS-only motion, finished state in the markup.
const slot = "[data-hero-smile]";

/** Every CSS animation running inside the hero visual, as plain data. */
const animations = (page: Page) =>
  page.evaluate((selector) => {
    const root = document.querySelector(selector)!;
    return root.getAnimations({ subtree: true }).map((animation) => ({
      end: animation.effect!.getComputedTiming().endTime as number,
      properties: [...new Set((animation.effect as KeyframeEffect).getKeyframes().flatMap((frame) => Object.keys(frame)))].filter(
        (key) => !["offset", "computedOffset", "easing", "composite"].includes(key),
      ),
    }));
  }, slot);

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the entrance is CSS only, animates compositor-friendly properties and ends within 5 s (D-041, WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/en");
    const list = await animations(page);
    expect(list.length).toBeGreaterThan(8); // disc, line, glow, dot, eight teeth, sheen…
    expect(Math.max(...list.map((a) => a.end))).toBeLessThanOrEqual(5000);
    const allowed = new Set(["opacity", "transform", "strokeDashoffset"]);
    expect(list.flatMap((a) => a.properties).filter((property) => !allowed.has(property))).toEqual([]);
  });

  test("it plays once and then rests: every animation finishes and nothing loops", async ({ page }) => {
    await page.goto("/en");
    await page.waitForFunction((selector) => document.querySelector(selector)!.getAnimations({ subtree: true }).every((a) => a.playState === "finished"), slot, { timeout: 8000 });
    const infinite = await page.evaluate((selector) => document.querySelector(selector)!.getAnimations({ subtree: true }).filter((a) => a.effect!.getComputedTiming().iterations === Infinity).length, slot);
    expect(infinite).toBe(0);
  });

  test("on phones the same story plays faster, and the outer teeth step aside", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const desktop = 4600; // longest desktop animation end, ms (hero-smile.css timeline)
    expect(Math.max(...(await animations(page)).map((a) => a.end))).toBeLessThan(desktop * 0.8);
    const hidden = await page.locator("[data-hs-outer]").evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).display));
    expect(hidden).toEqual(Array(2).fill("none")); // the two premolars; six teeth, canine to canine, remain
  });

  test("a fine pointer calls the pearl sheen again by hovering the visual (desktop only, no JS)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const sheen = page.locator('[data-hs="hover-sweep"]');
    const x = () => sheen.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    const before = await x();
    await page.locator(slot).hover();
    await expect.poll(x, { timeout: 4000 }).toBeGreaterThan(before + 500);
  });

  test("Persian is drawn from its own start side: the art mirrors in RTL only", async ({ page }) => {
    const flip = () => page.locator(`${slot} svg`).evaluate((el) => getComputedStyle(el).transform);
    await page.goto("/en");
    expect(await flip()).toBe("none");
    await page.goto("/fa");
    expect(await flip()).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing moves and the finished smile is shown — no travelling light left over", async ({ page }) => {
    await page.goto("/en");
    expect(await animations(page)).toEqual([]);
    expect(await page.locator('[data-hs="dot"]').evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    expect(await page.locator('[data-hs="line"]').evaluate((el) => getComputedStyle(el).strokeDashoffset)).toBe("0px");
    await expect(page.locator('[data-hs="tooth"]')).toHaveCount(8);
    expect(await page.locator('[data-hs="tooth"]').first().evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test("the visual is decorative inline SVG: no canvas, no image, no 3D asset, hidden from assistive technology", async ({ page }) => {
  const assets: string[] = [];
  page.on("request", (request) => /\/(images\/hero|models)\//.test(request.url()) && assets.push(request.url()));
  await page.goto("/en");
  await expect(page.locator(`${slot} svg`)).toHaveCount(1);
  await expect(page.locator(`${slot} img, ${slot} canvas`)).toHaveCount(0);
  await expect(page.locator(slot)).toHaveAttribute("aria-hidden", "true");
  expect(assets).toEqual([]);
});

test("the finished smile is in the HTML itself: without JavaScript it is all there", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator('[data-hs="tooth"]')).toHaveCount(8);
  await expect(page.locator('[data-hs="line"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("the visual keeps its box on every screen, so it can never shift the page", async ({ page }) => {
  for (const [width, height] of [[1440, 900], [1024, 768], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/en");
    const box = await page.locator(slot).boundingBox();
    expect(box!.width, `${width}×${height}`).toBeGreaterThan(150);
    expect(box!.height, `${width}×${height}`).toBeGreaterThan(150);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}×${height} no sideways scroll`).toBe(true);
  }
});
