import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" }); // exercises motion and the WebGL hero

test("poster shows at once; on a capable desktop the 3D canvas then fades in", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await expect(page.locator("[data-hero-poster]")).toBeVisible();
  await expect(page.locator("[data-hero-canvas][data-ready]")).toBeVisible({ timeout: 20_000 });
});

test("the tooth model is fetched only after the page load event (never on the critical path)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await expect(page.locator("[data-hero-canvas][data-ready]")).toBeVisible({ timeout: 20_000 });
  const [model, loadEnd] = await page.evaluate(() => [
    performance.getEntriesByType("resource").find((entry) => entry.name.includes("tooth.bin"))?.startTime ?? -1,
    (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).loadEventEnd,
  ]);
  expect(model).toBeGreaterThan(loadEnd);
});

test("the digital-scan entrance settles within 5 s of the reveal (WCAG 2.2.2)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await expect(page.locator("[data-hero-canvas][data-ready]")).toBeVisible({ timeout: 20_000 });
  const revealed = Date.now();
  await expect(page.locator("[data-hero-canvas][data-settled]")).toBeAttached({ timeout: 8_000 });
  expect(Date.now() - revealed).toBeLessThan(5_500);
});

test("once settled the tooth stays at rest — the entrance never replays", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  const settled = page.locator("[data-hero-canvas][data-settled]");
  await expect(settled).toBeAttached({ timeout: 20_000 });
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(250);
    expect(await settled.count(), `still settled after ${(i + 1) * 250} ms`).toBe(1);
  }
});

const posterSrc = (page: import("@playwright/test").Page) =>
  page.locator("[data-hero-poster]").evaluate((img: HTMLImageElement) => decodeURIComponent(img.currentSrc));

test("the poster is the first frame of the scan; reduced motion gets the finished porcelain tooth", async ({ page }) => {
  await page.goto("/en");
  await expect.poll(() => posterSrc(page)).toContain("tooth-scan");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  await expect.poll(() => posterSrc(page)).toContain("tooth-poster");
});

test("reduced motion: poster only, the 3D chunk and model are never downloaded", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const models: string[] = [];
  page.on("request", (request) => request.url().includes("tooth.bin") && models.push(request.url()));
  await page.goto("/en");
  await page.waitForTimeout(4000);
  await expect(page.locator("[data-hero-poster]")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(models).toEqual([]);
});

test("without WebGL the poster stays and no canvas is created", async ({ playwright }) => {
  const browser = await playwright.chromium.launch({ args: ["--disable-webgl", "--disable-webgl2"] });
  const page = await browser.newPage({ baseURL: test.info().project.use.baseURL });
  await page.goto("/en");
  await page.waitForTimeout(4000);
  await expect(page.locator("[data-hero-poster]")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect.poll(() => posterSrc(page)).toContain("tooth-poster"); // the finished tooth, not the scan
  await browser.close();
});

test("the 3D area never blocks vertical scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await page.addStyleTag({ content: "main::after { content: ''; display: block; height: 200vh; }" }); // guarantee room to scroll
  const area = page.locator("[data-hero-canvas]");
  await expect(area).toHaveCSS("touch-action", "pan-y");
  const box = (await area.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});
