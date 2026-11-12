import { expect, test } from "@playwright/test";

// The hero's natural-smile portrait (D-080): a full-face, front-on person in an arch window; one short pass of motion.
const root = "[data-hero-portrait]";
const subject = `${root} .hero-portrait-subject`;
const backdrop = `${root} .hero-portrait-backdrop`;

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("one pass of about three seconds, only opacity and scale/translate, then rest", async ({ page }) => {
    await page.goto("/en");
    const list = await page.evaluate(() =>
      document.querySelector("[data-hero-portrait]")!.getAnimations({ subtree: true }).map((a) => ({
        end: a.effect!.getComputedTiming().endTime as number,
        infinite: a.effect!.getComputedTiming().iterations === Infinity,
        properties: [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((f) => Object.keys(f)))].filter((k) => !["offset", "computedOffset", "easing", "composite"].includes(k)),
      })),
    );
    expect(list.length).toBe(5); // window, backdrop, push-in, breath, glint
    expect(Math.max(...list.map((a) => a.end))).toBeLessThanOrEqual(3500);
    expect(list.some((a) => a.infinite)).toBe(false);
    expect(new Set(list.flatMap((a) => a.properties))).toEqual(new Set(["opacity", "scale", "translate"]));
    await page.waitForFunction(() => document.querySelector("[data-hero-portrait]")!.getAnimations({ subtree: true }).every((a) => a.playState === "finished"), undefined, { timeout: 7000 });
  });

  test("a fine pointer adds depth: the subject and the backdrop move apart", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    await page.waitForFunction(() => document.querySelector("[data-hero-portrait]")!.getAnimations({ subtree: true }).every((a) => a.playState === "finished"), undefined, { timeout: 7000 });
    const shift = (selector: string) => page.locator(selector).evaluate((el) => parseFloat(getComputedStyle(el).translate.split(" ")[0]) || 0);
    expect(await shift(subject)).toBe(0);
    await page.mouse.move(1400, 450);
    await expect.poll(() => shift(subject), { timeout: 3000 }).toBeGreaterThan(3);
    expect(await shift(backdrop)).toBeLessThan(-1);
    await page.mouse.move(10, 450);
    await expect.poll(() => shift(subject), { timeout: 3000 }).toBeLessThan(-3);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the finished portrait is shown, nothing moves, no pointer depth", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    expect(await page.locator(root).evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.locator(`${subject} img`).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await page.mouse.move(1400, 450);
    await page.waitForTimeout(400);
    expect(await page.locator(subject).evaluate((el) => getComputedStyle(el).translate)).toBe("0px");
  });
});

test("a full-face portrait in a 4:5 arch window that always fits its slot", async ({ page }) => {
  for (const [width, height] of [[1440, 900], [1024, 768], [820, 1180], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/en");
    const window = (await page.locator(`${root} .hero-portrait-window`).boundingBox())!;
    const slot = (await page.locator(root).boundingBox())!;
    expect(window.width / window.height, `${width}×${height} ratio`).toBeCloseTo(0.8, 1);
    expect(window.height, `${width}×${height} fits the slot`).toBeLessThanOrEqual(slot.height + 1);
    expect(window.width, `${width}×${height} width`).toBeLessThanOrEqual(slot.width + 1);
  }
});

test("decorative and fast: empty alt, hidden from assistive technology, eager high-priority image, no canvas, no 3D", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(`${root} img`)).toHaveCount(1);
  await expect(page.locator(`${root} img`)).toHaveAttribute("alt", "");
  await expect(page.locator(root)).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(`${root} img`)).toHaveAttribute("fetchpriority", "high");
  expect(await page.locator(`${root} img`).getAttribute("loading")).toBe("eager");
  await expect(page.locator(`${root} canvas`)).toHaveCount(0);
  expect(await page.locator(`${root} img`).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test("without JavaScript the portrait is in the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator(`${root} img`)).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});
