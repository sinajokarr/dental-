import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// G07–G09: About (our copy from confirmed facts), legal drafts (noindex until reviewed), localized 404.
const messages = (locale: string) => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")); // cwd: frontend/
const ABOUT = { fa: "about", en: "about", de: "ueber-uns", tr: "hakkimizda" };

for (const locale of ["fa", "en", "de", "tr"] as const) {
  test(`/${locale}/${ABOUT[locale]}: about page built from confirmed facts, with a consultation call to action`, async ({ page }) => {
    const m = messages(locale);
    const response = await page.goto(`/${locale}/${ABOUT[locale]}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.about.title);
    await expect(page.locator("[data-about-section]")).toHaveCount(m.about.sections.length);
    await expect(page.locator("main a[href$='#consultation'], main a[href*='free-consultation'], main a[href*='kostenlose-beratung'], main a[href*='ucretsiz-danismanlik']").first()).toBeVisible();
  });
}

for (const [path, key] of [
  ["/en/privacy", "privacy"],
  ["/de/datenschutz", "privacy"],
  ["/tr/kvkk-aydinlatma-metni", "kvkk"],
  ["/fa/kvkk", "kvkk"],
  ["/de/impressum", "notice"],
  ["/tr/yasal-bilgiler", "notice"],
] as const) {
  test(`${path}: legal draft page is marked as a draft and kept out of search until reviewed`, async ({ page }) => {
    const m = messages(path.split("/")[1]);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.legal[key].title);
    await expect(page.locator("[data-legal-draft]")).toHaveText(m.legal.draft);
    await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
  });
}

test("every footer link opens a page that exists", async ({ page, request }) => {
  await page.goto("/tr");
  for (const href of await page.getByRole("contentinfo").locator("a[href^='/']").evaluateAll((links) => links.map((a) => a.getAttribute("href")!))) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

for (const [locale, title] of [["fa", "صفحه پیدا نشد"], ["de", "Seite nicht gefunden"]] as const) {
  test(`/${locale}: an unknown address shows a localized 404 with a way back`, async ({ page }) => {
    const response = await page.goto(`/${locale}/does-not-exist`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("main").getByRole("link").first()).toHaveAttribute("href", `/${locale}`);
  });
}

test("about and privacy pages have no serious accessibility violations", async ({ page }) => {
  for (const path of ["/fa/about", "/en/privacy"]) {
    await page.goto(path);
    await expectNoSeriousA11yViolations(page);
  }
});
