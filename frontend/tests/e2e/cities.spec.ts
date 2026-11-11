import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The two cities, as licensed photos (decorative: never presented as the clinic, PROJECT_BRIEF §8).
const messages = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")); // cwd: frontend/

for (const [locale, path] of [["en", "/en"], ["fa", "/fa/international-patients"], ["de", "/de/internationale-patienten"]] as const) {
  test(`${path}: both cities shown with localized descriptions, loaded through the image optimizer`, async ({ page }) => {
    const m = messages(locale);
    await page.goto(path);
    const section = page.locator("section[aria-labelledby=cities-title]");
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(m.international.citiesTitle);
    for (const city of ["antalya", "istanbul"]) {
      const photo = section.getByRole("img", { name: m.cities[city].alt });
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toHaveAttribute("src", new RegExp(`/_next/image\\?url=.*${city}`)); // optimizer, hashed static import
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
      await expect(section).toContainText(m.cities[city].name);
    }
  });
}
