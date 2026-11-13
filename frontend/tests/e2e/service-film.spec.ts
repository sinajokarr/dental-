import { expect, test, type Page } from "@playwright/test";

// The treatment films (D-086): one short real film per treatment in a circular window, on the home page and in each
// treatment page's hero. Plays once when it is in view; the markup is the finished frame.
const film = "[data-service-film]";
const home = (page: Page) => page.locator(`section[aria-labelledby=treatments-title] ${film}`);
const state = (page: Page, i: number) => home(page).nth(i).getAttribute("data-state");
const bringIntoView = (page: Page, i: number) => home(page).nth(i).evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
const FILM = /treatments\/(implants|veneers|smile)-(480|720)\.(webm|mp4)/;

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("nothing is downloaded until a film is in view; then only that film loads, plays once and rests", async ({ page }) => {
    const loaded: string[] = [];
    page.on("request", (request) => FILM.test(request.url()) && loaded.push(request.url()));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    await expect(home(page)).toHaveCount(3);
    await page.waitForTimeout(800);
    expect(loaded).toEqual([]);
    for (const i of [0, 1, 2]) expect(await state(page, i)).toBeNull();
    await bringIntoView(page, 1);
    await expect.poll(() => state(page, 1), { timeout: 8000 }).toMatch(/play|ended/);
    expect(await state(page, 0)).toBeNull();
    expect(await state(page, 2)).toBeNull();
    expect(loaded.every((url) => url.includes("veneers-720"))).toBe(true);
    await expect.poll(() => state(page, 1), { timeout: 12_000 }).toBe("ended");
    const video = home(page).nth(1).locator("video");
    expect(await video.evaluate((v: HTMLVideoElement) => ({ loop: v.loop, muted: v.muted, controls: v.controls }))).toEqual({ loop: false, muted: true, controls: false });
    expect(await video.evaluate((v) => getComputedStyle(v).opacity)).toBe("1"); // rests on its last frame
  });

  test("phones get the small films", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/en");
    await bringIntoView(page, 2);
    await expect.poll(() => home(page).nth(2).locator("video").evaluate((v: HTMLVideoElement) => v.currentSrc), { timeout: 8000 }).toContain("smile-480");
    await context.close();
  });

  test("a treatment page plays its own film in the hero", async ({ page }) => {
    await page.goto("/en/dental-implants");
    const hero = page.locator(`section[aria-labelledby=page-title] ${film}`);
    await expect(hero).toHaveAttribute("data-service-film", "implants");
    await expect.poll(() => hero.getAttribute("data-state"), { timeout: 8000 }).toMatch(/play|ended/);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no film is loaded or shown; each window is its finished frame", async ({ page }) => {
    const loaded: string[] = [];
    page.on("request", (request) => FILM.test(request.url()) && loaded.push(request.url()));
    await page.goto("/en");
    for (const i of [0, 1, 2]) {
      await bringIntoView(page, i);
      await page.waitForTimeout(300);
      expect(await home(page).nth(i).evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(/-last\.webp/);
      await expect(home(page).nth(i).locator("video")).toBeHidden();
    }
    expect(loaded).toEqual([]);
  });
});

test("without JavaScript the finished frames are in the page and nothing autoplays", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(home(page)).toHaveCount(3);
  for (const i of [0, 1, 2]) expect(await home(page).nth(i).evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(/-last\.webp/);
  expect(await page.locator(`${film} video[autoplay]`).count()).toBe(0);
  await context.close();
});

test("decorative: hidden from assistive technology, no controls, no canvas; every file within budget", async ({ page }) => {
  await page.goto("/en");
  for (const i of [0, 1, 2]) {
    await expect(home(page).nth(i)).toHaveAttribute("aria-hidden", "true");
    await expect(home(page).nth(i).locator("video")).toHaveAttribute("tabindex", "-1");
  }
  await expect(page.locator(`${film} canvas`)).toHaveCount(0);
  const { statSync, readdirSync } = await import("node:fs");
  for (const file of readdirSync("public/images/treatments")) {
    const size = statSync(`public/images/treatments/${file}`).size;
    expect(size, file).toBeLessThanOrEqual(file.includes("-480.") ? 160 * 1024 : file.endsWith(".webp") ? 40 * 1024 : 400 * 1024);
  }
});
