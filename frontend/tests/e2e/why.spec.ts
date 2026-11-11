import { expect, test } from "@playwright/test";

test("why section lists the five confirmed advantages and links to the international page", async ({ page }) => {
  await page.goto("/tr");
  const section = page.locator("section[aria-labelledby=why-title]");
  await expect(section.getByRole("listitem")).toHaveCount(5);
  await expect(section.getByRole("link", { name: "Uluslararası hastalar için süreç" })).toHaveAttribute("href", "/tr/uluslararasi-hastalar");
});
