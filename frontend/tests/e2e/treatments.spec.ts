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

test("opening a treatment morphs its render into the next page (view transition)", async ({ page }) => {
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
  // The render arrives finished (D-082): in view at load, it is never armed and never replays its story.
  const art = page.locator("section[aria-labelledby=page-title] [data-service-art]");
  await expect(art).toHaveCount(1);
  await expect(art).not.toHaveAttribute("data-state");
  expect(await art.locator(".sr-i-crown").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  // …and a direct visit shows the same finished picture.
  await page.goto("/en/dental-implants");
  await expect(art).not.toHaveAttribute("data-state");
});
