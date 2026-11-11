import { expect, test } from "@playwright/test";

test("FAQ: nine verified questions in an exclusive native accordion, usable from the keyboard", async ({ page }) => {
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=faq-title]");
  const items = section.locator("details");
  await expect(items).toHaveCount(9);
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

test("FAQ answers the client-confirmed questions: languages, assessment before travel, stay length, follow-up", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  const section = page.locator("section[aria-labelledby=faq-title]");
  for (const [question, answer] of [
    ["Which languages do you speak?", "Persian, English, German or Turkish"],
    ["Can you assess my case before I travel?", "photos or X-rays on WhatsApp"],
    ["How long will I need to stay?", "3 to 8 days, depending on your treatment"],
    ["Do you follow up after treatment, and is there a guarantee?", "terms depend on the treatment"],
  ]) {
    await section.locator("summary", { hasText: question }).click();
    await expect(section.locator("details[open]")).toContainText(answer);
  }
});
