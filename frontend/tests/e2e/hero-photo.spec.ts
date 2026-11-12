import { expect, test } from "@playwright/test";

// The hero's editorial smile photograph (D-078): decorative, art-directed, one slow reveal, then rest.
const photo = "[data-hero-photo] img";

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("one slow reveal of opacity, scale and drift, under 3 s, then the picture rests", async ({ page }) => {
    await page.goto("/en");
    const list = await page.evaluate(() =>
      document.querySelector("[data-hero-photo]")!.getAnimations({ subtree: true }).map((a) => ({
        end: a.effect!.getComputedTiming().endTime as number,
        infinite: a.effect!.getComputedTiming().iterations === Infinity,
        properties: [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((f) => Object.keys(f)))].filter((k) => !["offset", "computedOffset", "easing", "composite"].includes(k)),
      })),
    );
    expect(list.length).toBe(1);
    expect(list[0].end).toBeLessThanOrEqual(3000);
    expect(list[0].infinite).toBe(false);
    expect(list[0].properties.sort()).toEqual(["opacity", "scale", "translate"]);
    await page.waitForFunction(() => document.querySelector("[data-hero-photo]")!.getAnimations({ subtree: true }).every((a) => a.playState === "finished"), undefined, { timeout: 6000 });
  });

  test("the photograph looks towards the headline: mirrored in Persian only", async ({ page }) => {
    const flip = () => page.locator(photo).evaluate((el) => getComputedStyle(el).transform);
    await page.goto("/en");
    expect(await flip()).toBe("none");
    await page.goto("/fa");
    expect(await flip()).toBe("matrix(-1, 0, 0, 1, 0, 0)");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the finished photograph is shown and nothing moves", async ({ page }) => {
    await page.goto("/en");
    expect(await page.locator("[data-hero-photo]").evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await page.locator(photo).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test("a decorative, art-directed photograph: alt is empty, hidden from assistive technology, no canvas, eager and high priority", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(photo)).toHaveAttribute("alt", "");
  await expect(page.locator("[data-hero-photo]")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("[data-hero-photo] canvas")).toHaveCount(0);
  await expect(page.locator(photo)).toHaveAttribute("fetchpriority", "high");
  expect(await page.locator(photo).getAttribute("loading")).toBe("eager");
  expect(await page.locator(photo).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
});

test("one source for every screen: a phone downloads the square photograph once, at a phone size", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (request) => request.url().includes("smile-") && urls.push(decodeURIComponent(request.url())));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await page.waitForTimeout(1500);
  expect(urls.length).toBe(1);
  expect(Number(/w=(\d+)/.exec(urls[0])![1])).toBeLessThanOrEqual(1200);
});

test("the white studio background multiplies into the page, so the photograph has no visible box", async ({ page }) => {
  await page.goto("/en");
  expect(await page.locator(photo).evaluate((el) => getComputedStyle(el).mixBlendMode)).toBe("multiply");
});

test("without JavaScript the photograph is in the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  await expect(page.locator(photo)).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});
