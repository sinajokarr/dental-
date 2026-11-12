import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" }); // exercises motion

test("trust strip lists only the five verified facts", async ({ page }) => {
  await page.goto("/en");
  const items = page.getByRole("list", { name: "At a glance" }).getByRole("listitem");
  await expect(items).toHaveText([
    "Free initial consultation",
    "Antalya & Istanbul",
    "In your language",
    "Online assessment before you travel",
    "Hotel, transfer & interpreter",
  ]);
});

test("each treatment card is one link (one tab stop) to its localized page", async ({ page }) => {
  await page.goto("/de");
  const section = page.locator("section[aria-labelledby=treatments-title]");
  const links = section.getByRole("link");
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute("href", "/de/zahnimplantate");
  await expect(links.nth(1)).toHaveAttribute("href", "/de/veneers");
  await expect(links.nth(2)).toHaveAttribute("href", "/de/smile-design");
});

test("treatments are chapters, not a numbered sequence", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=treatments-title]");
  await expect(section.locator("[data-treatment-card]")).toHaveCount(3);
  await expect(section).not.toContainText(/0[1-3]/);
});

const dashOffset = (path: import("@playwright/test").Locator) =>
  path.evaluate((p) => parseFloat(getComputedStyle(p).strokeDashoffset) || 0);

test("each chapter's line drawing draws itself as it scrolls into view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en");
  const drawing = page.locator("[data-draw]").nth(2);
  const firstLine = drawing.locator("[pathLength]").first();
  expect(await dashOffset(firstLine)).toBeGreaterThan(0.5); // far below the fold: not drawn yet
  await drawing.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect.poll(() => dashOffset(firstLine)).toBeLessThan(0.05);
});

test("with reduced motion every chapter and drawing is complete and still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fa");
  await expect(page.locator("[data-treatment-card]")).toHaveCount(3);
  const lines = page.locator("[data-draw] [pathLength]");
  expect(await lines.count()).toBeGreaterThan(12);
  for (const line of await lines.all()) expect(await dashOffset(line)).toBe(0);
});

test("opening a treatment morphs its drawing into the next page (view transition)", async ({ page }) => {
  // Records which elements are named when the browser snapshots the old page.
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    const names: string[] = ((window as unknown as { __vt: string[] }).__vt = []);
    document.startViewTransition = ((update: never) => {
      document.querySelectorAll<HTMLElement>("[style*=view-transition-name]").forEach((el) => names.push(el.style.viewTransitionName));
      return start(update);
    }) as typeof document.startViewTransition;
  });
  await page.goto("/en");
  await page.locator("section[aria-labelledby=treatments-title]").getByRole("link", { name: "Dental Implants" }).click();
  await expect(page).toHaveURL(/\/en\/dental-implants$/);
  expect(await page.evaluate(() => (window as unknown as { __vt: string[] }).__vt)).toContain("treatment-implants");
  await expect(page.getByRole("heading", { level: 1 }).filter({ visible: true })).toBeVisible();
  // The drawing arrived finished: it must not erase itself and draw again…
  const stroke = page.locator("[data-draw-load] [pathLength]").filter({ visible: true }).first();
  expect(await stroke.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  // …while a direct visit still draws it once.
  await page.goto("/en/dental-implants");
  expect(await stroke.evaluate((el) => getComputedStyle(el).animationName)).toBe("draw");
});
