import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// G01–G04: one template, three treatments, four languages (SITEMAP_AND_USER_FLOWS §5).
const messages = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")); // cwd: frontend/
const PAGES = [
  { key: "implants", value: "implants", context: "implants", slugs: { fa: "dental-implants", en: "dental-implants", de: "zahnimplantate", tr: "dis-implanti" } },
  { key: "veneers", value: "veneers", context: "veneers", slugs: { fa: "dental-veneers", en: "dental-veneers", de: "veneers", tr: "porselen-lamina" } },
  { key: "smileDesign", value: "smile_design", context: "smile_design", slugs: { fa: "smile-design", en: "smile-design", de: "smile-design", tr: "gulus-tasarimi" } },
] as const;

for (const locale of ["fa", "en", "de", "tr"] as const) {
  for (const treatment of PAGES) {
    test(`/${locale}/${treatment.slugs[locale]}: ${treatment.key} page with its sections, form preselection and WhatsApp message`, async ({ page }) => {
      const m = messages(locale);
      const response = await page.goto(`/${locale}/${treatment.slugs[locale]}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.treatments[treatment.key].title);
      for (const section of ["what", "who", "how"]) await expect(page.locator(`#${section}-title`)).toHaveText(m.treatmentPage[section]);
      await expect(page.locator("section[aria-labelledby=faq-title] details")).toHaveCount(m.treatments[treatment.key].faq.length);
      await expect(page.locator(`form#consultation-form [name=treatment][value=${treatment.value}]`)).toBeChecked();
      const wa = await page.locator("section[aria-labelledby=page-title] a[href^='https://wa.me/']").getAttribute("href");
      expect(new URL(wa!).searchParams.get("text")).toBe(m.whatsapp[treatment.context]);
      await expect(page.getByRole("navigation", { name: m.treatmentPage.breadcrumb }).getByRole("link")).toHaveAttribute("href", `/${locale}`);
    });
  }
}

test("the language switcher keeps the visitor on the same treatment", async ({ page }) => {
  await page.goto("/de/zahnimplantate");
  await page.getByRole("button", { name: /Sprache/ }).click();
  await expect(page.getByRole("navigation", { name: "Sprache" }).getByRole("link", { name: "Türkçe" })).toHaveAttribute("href", "/tr/dis-implanti");
});

for (const path of ["/fa/dental-veneers", "/en/smile-design"]) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoSeriousA11yViolations(page);
  });
}
