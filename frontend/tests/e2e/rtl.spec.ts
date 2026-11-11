import { expect, test } from "@playwright/test";

// F05 — direction QA. Persian mirrors layout and motion; numbers, phone fields and Latin brand text stay LTR.
test("Persian mirrors arrows and the journey run; phone numbers stay left-to-right", async ({ page }) => {
  await page.goto("/fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const arrow = page.locator("[data-treatment-card] svg").last();
  expect(await arrow.evaluate((el) => getComputedStyle(el).scale)).toBe("-1 1"); // Tailwind 4 flips with the scale property
  const run = await page.locator(".journey-run-x").evaluate((el) => getComputedStyle(el).getPropertyValue("--run").trim());
  expect(run).toBe("1");
  for (const number of await page.locator("a[href^='tel:'] bdi").all()) {
    await expect(number).toHaveAttribute("dir", "ltr");
    await expect(number).toHaveText("+90 542 713 01 32");
  }
  await expect(page.locator("form#consultation-form [name=phone]").locator("xpath=..")).toHaveAttribute("dir", "ltr");
});

test("English keeps the default direction for arrows and the journey run", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  const arrow = page.locator("[data-treatment-card] svg").last();
  expect(await arrow.evaluate((el) => getComputedStyle(el).scale)).toBe("none");
});

for (const locale of ["fa", "en", "de", "tr"]) {
  test(`/${locale} on a 360 px phone: every control sits inside the screen`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(`/${locale}`);
    const outside = await page.evaluate(() =>
      [...document.querySelectorAll("main :is(a, button, input, select, textarea, summary, h1, h2, h3)")]
        .filter((el) => !el.closest("[aria-hidden=true]") && (el as HTMLElement).offsetParent !== null)
        .map((el) => ({ el, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.width > 0 && (box.left < -1 || box.right > innerWidth + 1))
        .map(({ el, box }) => `${el.tagName.toLowerCase()}[${el.getAttribute("name") ?? el.textContent?.trim().slice(0, 24)}] ${Math.round(box.left)}–${Math.round(box.right)}`),
    );
    expect(outside).toEqual([]);
  });
}
