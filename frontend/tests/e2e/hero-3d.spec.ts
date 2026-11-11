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
