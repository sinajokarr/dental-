import { expect, test } from "@playwright/test";

test("FAQ: five verified questions in an exclusive native accordion, usable from the keyboard", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=faq-title]");
  const items = section.locator("details");
  await expect(items).toHaveCount(5);
  await section.locator("summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(items.nth(0)).toHaveAttribute("open", "");
  await section.locator("summary").nth(1).click();
  await expect(items.nth(1)).toHaveAttribute("open", "");
  await expect(items.nth(0)).not.toHaveAttribute("open", "");
  await expect(items.nth(1)).toContainText("Antalya and Istanbul");
});

test("FAQ offers WhatsApp for other questions", async ({ page }) => {
  await page.goto("/fa");
  const link = page.locator("section[aria-labelledby=faq-title]").getByRole("link", { name: "در واتس‌اپ بپرسید" });
  expect(await link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/905427130132/);
});
