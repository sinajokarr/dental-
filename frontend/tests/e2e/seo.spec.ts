import { expect, test } from "@playwright/test";

// F06 — international SEO (MULTILINGUAL_SEO_ARCHITECTURE): canonical, hreflang with localized slugs, sitemap,
// robots, structured data, share image, icons.
const IMPLANTS = { fa: "/fa/dental-implants", en: "/en/dental-implants", de: "/de/zahnimplantate", tr: "/tr/dis-implanti" };

test("a treatment page names itself and links every language version (hreflang + x-default)", async ({ page }) => {
  await page.goto("/de/zahnimplantate");
  await expect(page).toHaveTitle(/^Zahnimplantate \| JOKAR DENTAL$/);
  await expect(page.locator("meta[name=description]")).toHaveAttribute("content", /Titanimplantat/);
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", /^https?:\/\/[^/]+\/de\/zahnimplantate$/);
  for (const [lang, path] of Object.entries(IMPLANTS))
    await expect(page.locator(`link[rel=alternate][hreflang=${lang}]`)).toHaveAttribute("href", new RegExp(`${path}$`));
  await expect(page.locator("link[rel=alternate][hreflang=x-default]")).toHaveAttribute("href", /\/en\/dental-implants$/);
  await expect(page.locator("meta[property='og:locale']")).toHaveAttribute("content", "de_DE");
});

test("the homepage carries a descriptive title, organization data and a share image", async ({ page, request }) => {
  await page.goto("/fa");
  await expect(page).toHaveTitle(/JOKAR DENTAL/);
  const data = JSON.parse((await page.locator("script[type='application/ld+json']").first().textContent())!);
  expect(data).toMatchObject({ "@type": "MedicalOrganization", name: "JOKAR DENTAL", telephone: "+905427130132" });
  expect(data.availableLanguage).toEqual(["fa", "en", "de", "tr"]);
  const image = await page.locator("meta[property='og:image']").getAttribute("content");
  const response = await request.get(new URL(image!).pathname);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("sitemap lists every indexable page in all languages with alternates; legal drafts stay out", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const path of [...Object.values(IMPLANTS), "/tr/uluslararasi-hastalar", "/de/kostenlose-beratung", "/fa/about", "/en"])
    expect(xml).toContain(`${path}</loc>`);
  expect(xml).toContain('hreflang="de"');
  expect(xml).not.toContain("datenschutz");
  expect(xml).not.toContain("/privacy");
});

test("robots.txt allows crawling and points to the sitemap; legal drafts are noindex", async ({ request, page }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  await page.goto("/en/privacy");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
});

test("the site has a favicon and an Apple touch icon", async ({ page, request }) => {
  await page.goto("/en");
  for (const rel of ["icon", "apple-touch-icon"]) {
    const href = await page.locator(`link[rel='${rel}']`).first().getAttribute("href");
    expect((await request.get(href!)).status(), rel).toBe(200);
  }
});
