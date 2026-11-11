import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

const redirects: [acceptLanguage: string, target: string][] = [
  ["de-AT,de;q=0.9", "/de"],
  ["fa-IR,fa;q=0.9", "/fa"],
  ["tr-TR", "/tr"],
  ["en-GB", "/en"],
  ["ja", "/en"], // unsupported language falls back to English (D-011)
];

for (const [acceptLanguage, target] of redirects) {
  test(`"/" with Accept-Language "${acceptLanguage}" redirects to ${target}`, async ({ request }) => {
    const response = await request.get("/", { headers: { "Accept-Language": acceptLanguage }, maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(new URL(response.headers().location, "http://localhost").pathname).toBe(target);
  });
}

const directions = [
  ["fa", "rtl"],
  ["en", "ltr"],
  ["de", "ltr"],
  ["tr", "ltr"],
] as const;

for (const [locale, dir] of directions) {
  test(`/${locale} renders lang="${locale}" dir="${dir}" with no serious accessibility violations`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", dir);
    await expectNoSeriousA11yViolations(page);
  });
}

test("unknown page returns 404", async ({ request }) => {
  expect((await request.get("/en/does-not-exist")).status()).toBe(404);
});
