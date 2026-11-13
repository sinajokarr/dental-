import { expect, test } from "@playwright/test";

// The hero's film (D-084): a real person breaks into a natural smile, once, inside the arch window, and rests on the smile.
const root = "[data-hero-film]";
const video = `${root} video`;
const windowBox = `${root} .hero-film-window`;
const background = (page: import("@playwright/test").Page) => page.locator(windowBox).evaluate((el) => getComputedStyle(el).backgroundImage);

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the smile plays once, silently, and rests on its last frame", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    expect(await background(page)).toContain("first.webp"); // the film's first frame until it starts: no jump
    const state = () => page.locator(video).evaluate((v: HTMLVideoElement) => ({ ended: v.ended, loop: v.loop, muted: v.muted, controls: v.controls, src: v.currentSrc, t: v.currentTime }));
    await expect.poll(async () => (await state()).ended, { timeout: 12_000 }).toBe(true);
    const end = await state();
    expect(end.loop).toBe(false);
    expect(end.muted).toBe(true);
    expect(end.controls).toBe(false);
    expect(end.src).toContain("smile-720");
    expect(end.t).toBeGreaterThan(4);
    await page.waitForTimeout(600);
    expect((await state()).t).toBe(end.t); // rests: no loop, no restart
  });

  test("the window opens once with opacity and scale only", async ({ page }) => {
    await page.goto("/en");
    const list = await page.evaluate(() =>
      document.querySelector("[data-hero-film]")!.getAnimations({ subtree: true }).map((a) => ({
        end: a.effect!.getComputedTiming().endTime as number,
        infinite: a.effect!.getComputedTiming().iterations === Infinity,
        properties: [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((f) => Object.keys(f)))].filter((k) => !["offset", "computedOffset", "easing", "composite"].includes(k)),
      })),
    );
    expect(list.length).toBe(1);
    expect(list[0].end).toBeLessThanOrEqual(1200);
    expect(list[0].infinite).toBe(false);
    expect(new Set(list[0].properties)).toEqual(new Set(["opacity", "scale"]));
  });

  test("phones get the small film", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/en");
    await expect.poll(() => page.locator(video).evaluate((v: HTMLVideoElement) => v.currentSrc), { timeout: 8000 }).toContain("smile-480");
    await context.close();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no film: the finished smile is a still picture and nothing is downloaded for the video", async ({ page }) => {
    const films: string[] = [];
    page.on("request", (request) => /smile-\d+\.(webm|mp4)/.test(request.url()) && films.push(request.url()));
    await page.goto("/en");
    await page.waitForTimeout(1200);
    expect(await background(page)).toContain("last.webp");
    expect(await page.locator(root).evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(page.locator(video)).toBeHidden();
    expect(films).toEqual([]);
  });
});

test("a 4:5 arch window that always fits its slot", async ({ page }) => {
  for (const [width, height] of [[1440, 900], [1024, 768], [820, 1180], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/en");
    const box = (await page.locator(windowBox).boundingBox())!;
    const slot = (await page.locator(root).boundingBox())!;
    expect(box.width / box.height, `${width}×${height} ratio`).toBeCloseTo(0.8, 1);
    expect(box.height, `${width}×${height} fits the slot`).toBeLessThanOrEqual(slot.height + 1);
    expect(box.width, `${width}×${height} width`).toBeLessThanOrEqual(slot.width + 1);
  }
});

test("decorative: hidden from assistive technology, no controls, no canvas, no 3D", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(root)).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(video)).toHaveCount(1);
  await expect(page.locator(video)).toHaveAttribute("tabindex", "-1");
  await expect(page.locator(`${root} canvas`)).toHaveCount(0);
});

test("without JavaScript the film is in the page and plays natively; the headline does not wait for it", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(video)).toHaveAttribute("autoplay", "");
  await expect(page.locator(video)).toHaveAttribute("muted", "");
  await expect(page.locator(video)).toHaveAttribute("playsinline", "");
  await context.close();
});
