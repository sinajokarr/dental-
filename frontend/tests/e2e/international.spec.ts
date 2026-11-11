import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// G05 — International Patients: what we coordinate, the journey, the stay, travel questions, the form.
const messages = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")); // cwd: frontend/
const SLUGS = { fa: "international-patients", en: "international-patients", de: "internationale-patienten", tr: "uluslararasi-hastalar" };

for (const locale of ["fa", "en", "de", "tr"] as const) {
  test(`/${locale}/${SLUGS[locale]}: services, journey, stay, travel FAQ and the international WhatsApp message`, async ({ page }) => {
    const m = messages(locale);
    const response = await page.goto(`/${locale}/${SLUGS[locale]}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.international.title);
    await expect(page.locator("section[aria-labelledby=services-title] li")).toHaveCount(m.international.services.length);
    await expect(page.locator("section[aria-labelledby=journey-title] ol > li")).toHaveCount(5);
    await expect(page.locator("#stay-title")).toHaveText(m.international.stayTitle);
    await expect(page.locator("section[aria-labelledby=faq-title] details")).toHaveCount(6);
    await expect(page.locator("form#consultation-form")).toBeVisible();
    const wa = await page.locator("section[aria-labelledby=page-title] a[href^='https://wa.me/']").getAttribute("href");
    expect(new URL(wa!).searchParams.get("text")).toBe(m.whatsapp.international);
  });
}

test("the international page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/fa/international-patients");
  await expectNoSeriousA11yViolations(page);
});
