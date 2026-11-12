import { expect, test, type Page } from "@playwright/test";

// The three animated illustrations of the home "main services" section (D-077): Implant assembly, Porcelain veneers,
// Signature smile. Each plays once when it scrolls into view; the markup itself is the finished picture.
const art = "[data-service-art]";
const NAMES = ["implants", "veneers", "smile design"];

const state = (page: Page, i: number) => page.locator(art).nth(i).getAttribute("data-state");
const timings = (page: Page, i: number) =>
  page.evaluate((index) => {
    const root = document.querySelectorAll("[data-service-art]")[index];
    return root.getAnimations({ subtree: true }).map((animation) => ({
      end: animation.effect!.getComputedTiming().endTime as number,
      infinite: animation.effect!.getComputedTiming().iterations === Infinity,
      running: animation.playState === "running",
      properties: [...new Set((animation.effect as KeyframeEffect).getKeyframes().flatMap((frame) => Object.keys(frame)))].filter(
        (key) => !["offset", "computedOffset", "easing", "composite"].includes(key),
      ),
    }));
  }, i);
const bringIntoView = (page: Page, i: number) => page.locator(art).nth(i).evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("three illustrations wait below the fold and each starts only when it is itself in view", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    await expect(page.locator(art)).toHaveCount(3);
    for (let i = 0; i < 3; i++) await expect.poll(() => state(page, i)).toBe("armed");
    await bringIntoView(page, 0);
    await expect.poll(() => state(page, 0)).toBe("play");
    expect([await state(page, 1), await state(page, 2)]).toEqual(["armed", "armed"]); // entering one never starts another
    await bringIntoView(page, 1);
    await expect.poll(() => state(page, 1)).toBe("play");
    expect(await state(page, 2)).toBe("armed");
  });

  test("each story is short, uses only opacity, transform and stroke properties, plays once and rests", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    const allowed = new Set(["opacity", "transform", "strokeDashoffset", "strokeDasharray"]);
    for (let i = 0; i < 3; i++) {
      await expect.poll(() => state(page, i), { message: NAMES[i] }).toBe("armed");
      await bringIntoView(page, i);
      await expect.poll(() => state(page, i)).toBe("play");
      const list = await timings(page, i);
      expect(list.length, `${NAMES[i]}: animations`).toBeGreaterThan(5);
      expect(Math.max(...list.map((a) => a.end)), `${NAMES[i]}: story length`).toBeLessThanOrEqual(3200);
      expect(list.some((a) => a.infinite), `${NAMES[i]}: no loops`).toBe(false);
      expect(list.flatMap((a) => a.properties).filter((property) => !allowed.has(property)), `${NAMES[i]}: properties`).toEqual([]);
      await page.waitForFunction((index) => document.querySelectorAll("[data-service-art]")[index].getAnimations({ subtree: true }).every((a) => a.playState === "finished"), i, { timeout: 8000 });
    }
    // Scrolling away and back never replays a finished story.
    await page.evaluate(() => scrollTo(0, 0));
    await bringIntoView(page, 0);
    await page.waitForTimeout(400);
    expect((await timings(page, 0)).some((a) => a.running)).toBe(false);
    expect(await state(page, 0)).toBe("play");
  });

  test("the same three stories run in every language, in RTL and LTR, with nothing mirrored or reflowed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const locale of ["fa", "de", "tr"]) {
      await page.goto(`/${locale}`);
      await expect(page.locator(art)).toHaveCount(3);
      await expect.poll(() => state(page, 2)).toBe("armed");
      await bringIntoView(page, 2);
      await expect.poll(() => state(page, 2)).toBe("play");
      expect((await timings(page, 2)).length, locale).toBeGreaterThan(20);
      expect(await page.locator(`${art} svg`).nth(2).evaluate((el) => getComputedStyle(el).transform), locale).toBe("none");
    }
  });

  test("phones: the same stories play a little faster and the construction marks step aside, no sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    await expect.poll(() => state(page, 2)).toBe("armed");
    const desktop = Math.max(...(await timings(page, 2)).map((a) => a.end));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await expect.poll(() => state(page, 2)).toBe("armed");
    expect(Math.max(...(await timings(page, 2)).map((a) => a.end))).toBeLessThan(desktop * 0.9);
    expect(await page.locator("[data-sv-extra]").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("a fine pointer calls the smile's sheen again by hovering it (no JS)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    await bringIntoView(page, 2);
    const sheen = page.locator(".sv-s-hover");
    const x = () => sheen.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    const before = await x();
    const box = (await page.locator("[data-treatment-card]").nth(2).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); // the card is one stretched link: hover it, not the art
    await expect.poll(x, { timeout: 4000 }).toBeGreaterThan(before + 200);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing is armed or animated, and every illustration is its finished picture", async ({ page }) => {
    await page.goto("/fa");
    await expect(page.locator(art)).toHaveCount(3);
    await page.waitForTimeout(500); // after hydration
    for (let i = 0; i < 3; i++) {
      expect(await state(page, i)).toBeNull();
      expect(await timings(page, i)).toEqual([]);
    }
    const opacity = (selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).opacity);
    expect(await opacity(".sv-i-crown")).toBe("1"); // implant: crown seated and visible
    expect(await opacity(".sv-v-shell")).toBe("1"); // veneer: shell visible
    expect(await opacity(".sv-s-fill")).toBe("1"); // smile: teeth filled
    expect(await opacity(".sv-s-dot")).toBe("0"); // …and no travelling light left over
    expect(await opacity(".sv-i-chev")).toBe("0"); // …nor assembly arrows
  });
});

test("without JavaScript all three finished illustrations are in the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator(`${art} svg`)).toHaveCount(3);
  await expect(page.locator(".sv-i-crown, .sv-v-shell, .sv-s-tooth")).toHaveCount(1 + 1 + 6);
  await expect(page.locator(`${art}[data-state]`)).toHaveCount(0);
  await context.close();
});

test("illustrations are decorative: hidden from assistive technology, no images, no canvas", async ({ page }) => {
  await page.goto("/en");
  for (const svg of await page.locator(`${art} svg`).all()) await expect(svg).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(`${art} img, ${art} canvas`)).toHaveCount(0);
});
