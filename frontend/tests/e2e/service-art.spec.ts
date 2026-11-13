import { expect, test, type Page } from "@playwright/test";

// The three illustrations of the home "main services" section (D-081): studio renders of an implant assembly, a porcelain
// veneer and a natural smile arch with planning guides. Each plays once when it scrolls into view; the markup is the finished picture.
const art = "[data-service-art]";
const NAMES = ["implants", "veneers", "smile design"];
const RENDER = /(fixture|abutment|gum|crown|tooth|shell|arch)\./;

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
    const allowed = new Set(["opacity", "translate", "scale", "strokeDashoffset", "strokeDasharray"]);
    for (let i = 0; i < 3; i++) {
      await expect.poll(() => state(page, i), { message: NAMES[i] }).toBe("armed");
      await bringIntoView(page, i);
      await expect.poll(() => state(page, i)).toBe("play");
      const list = await timings(page, i);
      expect(list.length, `${NAMES[i]}: animations`).toBeGreaterThan(2);
      expect(Math.max(...list.map((a) => a.end)), `${NAMES[i]}: story length`).toBeLessThanOrEqual(3400);
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
      expect((await timings(page, 2)).length, locale).toBeGreaterThan(2);
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
    expect(await page.locator("[data-sr-extra]").first().evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("a fine pointer over the smile chapter calls the planning guides back (no JS)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    await expect.poll(() => state(page, 2)).toBe("armed");
    await bringIntoView(page, 2);
    await page.waitForFunction((index) => document.querySelectorAll("[data-service-art]")[index].getAnimations({ subtree: true }).every((a) => a.playState === "finished"), 2, { timeout: 9000 });
    const guides = () => page.locator(".sr-s-guides").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(await guides()).toBe(0); // the story ended on the natural arch
    const box = (await page.locator("[data-treatment-card]").nth(2).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); // the card is one stretched link: hover it, not the art
    await expect.poll(guides, { timeout: 4000 }).toBeGreaterThan(0.5);
  });

  test("the renders are light: every image under 120 KB, all of them together under 700 KB", async ({ page }) => {
    const sizes: number[] = [];
    page.on("response", async (response) => {
      if (response.url().includes("/_next/image") && RENDER.test(decodeURIComponent(response.url()))) sizes.push((await response.body()).length);
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    for (let i = 0; i < 3; i++) {
      await bringIntoView(page, i);
      await page.waitForTimeout(1200);
    }
    expect(sizes.length).toBeGreaterThanOrEqual(8);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(120 * 1024);
    expect(sizes.reduce((sum, n) => sum + n, 0)).toBeLessThanOrEqual(700 * 1024);
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
    expect(await opacity(".sr-i-crown")).toBe("1"); // implant: crown seated and visible
    expect(await opacity(".sr-v-shell")).toBe("1"); // veneer: shell seated and visible
    expect(await opacity(".sr-s-arch")).toBe("1"); // smile: the natural arch
    expect(await opacity(".sr-s-guides")).toBe("0"); // …without planning guides
    expect(await opacity(".sr-v-guides")).toBe("0"); // …and no approach arrow left over
  });
});

test("without JavaScript all three finished illustrations are in the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator(`${art} svg`)).toHaveCount(3);
  await expect(page.locator(`${art} img`)).toHaveCount(4 + 3 + 1); // fixture, abutment, gum, crown · tooth, gum, shell · arch
  await expect(page.locator(`${art}[data-state]`)).toHaveCount(0);
  await context.close();
});

test("illustrations are decorative: hidden from assistive technology, empty alt on every render, no canvas", async ({ page }) => {
  await page.goto("/en");
  for (const svg of await page.locator(`${art} svg`).all()) await expect(svg).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(`${art} canvas`)).toHaveCount(0);
  for (const img of await page.locator(`${art} img`).all()) await expect(img).toHaveAttribute("alt", "");
});
