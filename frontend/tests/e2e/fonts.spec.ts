import { expect, test, type Page } from "@playwright/test";

async function fontRequests(page: Page, path: string): Promise<string[]> {
  const fonts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fonts.push(new URL(request.url()).pathname);
  });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return fonts;
}

test("Persian pages download only Vazirmatn (D-049)", async ({ page }) => {
  const fonts = await fontRequests(page, "/fa");
  expect(fonts).toContain("/fonts/vazirmatn.woff2");
  expect(fonts.filter((font) => !font.includes("vazirmatn"))).toEqual([]);
});

for (const locale of ["en", "de", "tr"]) {
  test(`/${locale} downloads the Latin fonts and never Vazirmatn`, async ({ page }) => {
    const fonts = await fontRequests(page, `/${locale}`);
    expect(fonts).toContain("/fonts/cormorant-garamond.woff2");
    expect(fonts).toContain("/fonts/manrope.woff2");
    expect(fonts.some((font) => font.includes("vazirmatn"))).toBe(false);
  });
}
