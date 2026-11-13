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
      await expect(page.locator("#explorer-title")).toHaveText(m.treatments[treatment.key].explorer.title);
      await expect(page.locator(`[data-explorer=${treatment.key}]`)).toHaveCount(1);
      await expect(page.locator("[data-note] h2")).toHaveText(m.treatments[treatment.key].notes.map((note: { title: string }) => note.title));
      await expect(page.locator("canvas")).toHaveCount(0);
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

// D-082: each treatment has its own explorer, driven by one native control and usable from the keyboard.
const opacity = (page: import("@playwright/test").Page, selector: string) => page.locator(selector).first().evaluate((el) => Number(getComputedStyle(el).opacity));

test("implant anatomy: choosing a part with the keyboard explains it and lets the other parts step back", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/dental-implants");
  const m = messages("en").treatments.implants.explorer;
  const crown = page.getByRole("button", { name: m.items[2].title, exact: true });
  await expect(crown).toHaveAttribute("aria-pressed", "false");
  expect(await opacity(page, "[data-explorer] .sr-i-fixture")).toBe(1);
  await crown.focus();
  await page.keyboard.press("Enter");
  await expect(crown).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-explorer] [aria-live]")).toContainText(m.items[2].text);
  expect(await opacity(page, "[data-explorer] .sr-i-fixture")).toBeLessThan(0.3);
  expect(await opacity(page, "[data-explorer] .sr-i-crown")).toBe(1);
  await page.keyboard.press("Enter"); // the same part again: back to the whole implant
  await expect(crown).toHaveAttribute("aria-pressed", "false");
  expect(await opacity(page, "[data-explorer] .sr-i-fixture")).toBe(1);
});

test("porcelain layers: the slider moves the shell off the tooth and back, and names the position", async ({ page }) => {
  await page.goto("/en/dental-veneers");
  const m = messages("en").treatments.veneers.explorer;
  const slider = page.getByRole("slider", { name: m.hint });
  const shell = () => page.locator("[data-explorer] .sr-v-shell").evaluate((el) => getComputedStyle(el).translate);
  await expect(slider).toHaveAttribute("aria-valuetext", m.seated);
  expect(await shell()).toBe("0% 0%");
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuetext", m.apart);
  await expect(page.locator("[data-explorer] [aria-live]")).toContainText(m.items[0].text);
  expect(await shell()).toBe("-24% 5%");
  await page.keyboard.press("End");
  expect(await shell()).toBe("0% 0%");
});

test("smile analysis: every guide follows its own checkbox", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fa/smile-design");
  const m = messages("fa").treatments.smileDesign.explorer;
  const boxes = page.locator("[data-explorer] input[type=checkbox]");
  await expect(boxes).toHaveCount(4);
  await expect(page.getByRole("group", { name: m.hint })).toBeVisible();
  expect(await opacity(page, "[data-explorer] .sr-s-arc")).toBe(1); // midline and arc start on
  expect(await opacity(page, "[data-explorer] .sr-dot")).toBe(0);
  await page.getByRole("checkbox", { name: new RegExp(m.items[3].title) }).check();
  expect(await opacity(page, "[data-explorer] .sr-dot")).toBe(1);
  await page.getByRole("checkbox", { name: new RegExp(m.items[1].title) }).uncheck();
  expect(await opacity(page, "[data-explorer] .sr-s-arc")).toBe(0);
});

for (const path of ["/fa/dental-veneers", "/en/smile-design", "/en/dental-implants", "/de/veneers", "/tr/gulus-tasarimi"]) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expectNoSeriousA11yViolations(page);
  });
}
