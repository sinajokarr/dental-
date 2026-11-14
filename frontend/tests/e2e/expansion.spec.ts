import { expect, test } from "@playwright/test";

// V7 expansion (D-091): the implant and smile-design pages gain their new sections in all four languages, after the
// page's own content and before the international band; the pictures work without JavaScript and reduced motion shows
// the complete final state. Scope (nothing else changed) is v7-scope.spec.ts.
const PAGES = [
  { locale: "fa", implants: "/fa/dental-implants", smile: "/fa/smile-design" },
  { locale: "en", implants: "/en/dental-implants", smile: "/en/smile-design" },
  { locale: "de", implants: "/de/zahnimplantate", smile: "/de/smile-design" },
  { locale: "tr", implants: "/tr/dis-implanti", smile: "/tr/gulus-tasarimi" },
];
// Latin words that legitimately appear on the Persian page: product and brand names, technical names.
const ALLOWED = /All-on-4|All-on-6|CAD\/CAM|Straumann Group|Straumann|Nobel Biocare|Medentika|Osstem|JOKAR DENTAL|3D/g;

for (const { locale, implants, smile } of PAGES) {
  test(`${locale}: the implant page has its four new sections between its notes and the international band`, async ({ page }) => {
    await page.goto(implants);
    const ids = await page.locator("main > section").evaluateAll((sections) => sections.map((s) => s.getAttribute("aria-labelledby")));
    const at = ids.indexOf("xp-implants-title");
    expect(ids.slice(at, at + 5)).toEqual(["xp-implants-title", "xp-single", "xp-immediate", "xp-support", "intl-title"]);
    expect(ids[at - 1]).toBe("notes-title-0");
    await expect(page.locator("#xp-implants-title")).toBeVisible();
    for (const brand of ["Straumann", "Nobel Biocare", "Medentika", "Osstem"]) await expect(page.locator(".xp-brand-name", { hasText: brand })).toHaveCount(1);
    await expect(page.locator("details.faq")).toHaveCount(11); // 6 existing questions + 5 new ones
  });

  test(`${locale}: the smile-design page has its three new sections in place`, async ({ page }) => {
    await page.goto(smile);
    const ids = await page.locator("main > section").evaluateAll((sections) => sections.map((s) => s.getAttribute("aria-labelledby")));
    const at = ids.indexOf("xp-smile-title");
    expect(ids.slice(at, at + 4)).toEqual(["xp-smile-title", "xp-gum", "xp-whitening", "intl-title"]);
    await expect(page.locator(".xp-strip > li")).toHaveCount(5);
    await expect(page.locator("details.faq")).toHaveCount(10); // 6 existing questions + 4 new ones
  });
}

test("fa: no stray English in the new sections (names of products and techniques excepted)", async ({ page }) => {
  for (const path of ["/fa/dental-implants", "/fa/smile-design"]) {
    await page.goto(path);
    const text = (await page.locator('section[aria-labelledby^="xp-"]').allInnerTexts()).join(" ").replace(ALLOWED, "");
    expect(text.match(/[A-Za-z]{2,}/g), path).toBeNull();
  }
});

test("full arch: the native All-on-4 / All-on-6 choice switches between the two films", async ({ page }) => {
  await page.goto("/en/dental-implants");
  const four = page.locator('[data-film="fullarch"]'), six = page.locator('[data-film="fullarch6"]');
  await expect(four).toBeVisible();
  await expect(six).toBeHidden();
  await page.getByText("All-on-6", { exact: true }).click();
  await expect(six).toBeVisible();
  await expect(four).toBeHidden();
});

test("reduced motion: every film is its finished last frame and no video is downloaded", async ({ page }) => {
  const videos: string[] = [];
  page.on("request", (r) => /\.(webm|mp4)/.test(r.url()) && videos.push(r.url()));
  await page.goto("/en/dental-implants");
  for (const name of ["fullarch", "implant", "graft", "sinus"]) {
    const film = page.locator(`[data-film="${name}"]`);
    await film.scrollIntoViewIfNeeded();
    expect(await film.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(`${name}-last.webp`);
  }
  expect(videos.filter((u) => /fullarch|implant-|graft|sinus/.test(u))).toEqual([]);
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });
  test("a film loads only when it scrolls into view, then plays once", async ({ page }) => {
    await page.goto("/en/dental-implants");
    const film = page.locator('[data-film="sinus"]');
    expect(await film.locator("source[src]").count()).toBe(0);
    await film.scrollIntoViewIfNeeded();
    await expect(film).toHaveAttribute("data-state", /play|ended|still/, { timeout: 15_000 });
    expect(await film.locator("source[src]").count()).toBeGreaterThan(0);
  });
});

test("phone: the new sections never widen the page", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const path of ["/fa/dental-implants", "/de/zahnimplantate", "/fa/smile-design", "/tr/gulus-tasarimi"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
});

test("pictures load lazily: no expansion render is requested before it is near the viewport", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (r) => /crown|shades|photos%2Fv7|photos\/v7|\.webm|\.mp4/.test(r.url()) && requested.push(r.url()));
  await page.goto("/en/smile-design");
  await page.waitForLoadState("networkidle");
  expect(requested).toEqual([]);
});
