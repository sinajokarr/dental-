import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// G06 — Free Consultation: the target of every header and menu CTA.
const messages = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")); // cwd: frontend/
const SLUGS = { fa: "free-consultation", en: "free-consultation", de: "kostenlose-beratung", tr: "ucretsiz-danismanlik" };

for (const locale of ["fa", "en", "de", "tr"] as const) {
  test(`/${locale}: the header CTA leads to the consultation page with the form, next steps, WhatsApp and phone`, async ({ page }) => {
    const m = messages(locale);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}`);
    await page.getByRole("banner").getByRole("link", { name: m.nav.cta }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/${SLUGS[locale]}$`));
    // With Cache Components the previous page stays in the DOM, hidden by <Activity>: look at the visible one.
    const section = page.locator("section#consultation").filter({ visible: true });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.consultationPage.title);
    await expect(section.locator("form#consultation-form")).toBeVisible();
    await expect(section.locator("ol > li")).toHaveCount(3);
    await expect(section.locator("a[href^='tel:']")).toBeVisible();
    await expect(section.locator("a[href^='https://wa.me/']").first()).toBeVisible();
  });
}

test("the consultation page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/de/kostenlose-beratung");
  await expectNoSeriousA11yViolations(page);
});
