import { expect, test } from "@playwright/test";

test("why section lists the five confirmed advantages and links to the international page", async ({ page }) => {
  await page.goto("/tr");
  const section = page.locator("section[aria-labelledby=why-title]");
  await expect(section.getByRole("listitem")).toHaveCount(5);
  await expect(section.getByRole("link", { name: "Uluslararası hastalar için süreç" })).toHaveAttribute("href", "/tr/uluslararasi-hastalar");
});

test("why section has no reused decorative image and no fake numbering (the items are not a sequence)", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=why-title]");
  await expect(section.locator("img")).toHaveCount(0);
  await expect(section).not.toContainText(/0[1-5]/);
});
