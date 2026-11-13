import { expect, test } from "@playwright/test";

test("why section lists the six confirmed advantages and links to the international page", async ({ page }) => {
  await page.goto("/tr");
  const section = page.locator("section[aria-labelledby=why-title]");
  await expect(section.getByRole("listitem")).toHaveCount(6);
  await expect(section.getByRole("link", { name: "Uluslararası hastalar için süreç" })).toHaveAttribute("href", "/tr/uluslararasi-hastalar");
});

test("why section has one photograph of its own (D-087) and no fake numbering (the items are not a sequence)", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=why-title]");
  await expect(section.locator("img")).toHaveCount(1);
  const src = await section.locator("img").getAttribute("src");
  expect(src).toContain("consultation");
  expect(await page.locator(`img[src="${src}"]`).count()).toBe(1); // not reused elsewhere on the page
  await expect(section).not.toContainText(/0[1-5]/);
});
