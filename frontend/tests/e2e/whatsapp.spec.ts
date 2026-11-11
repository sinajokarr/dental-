import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// WHATSAPP_TELEGRAM_INTEGRATION §A3: every placement prefills the message of its context, in the page language.
const messages = (locale: string) =>
  JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")) /* cwd: frontend/ */.whatsapp as Record<string, string>;

const placements: [name: string, selector: string, context: string][] = [
  ["header", "header", "general"],
  ["hero", "section[aria-labelledby=hero-title]", "general"],
  ["international journey", "section[aria-labelledby=journey-title]", "international"],
  ["faq", "section[aria-labelledby=faq-title]", "general"],
  ["consultation", "section#consultation", "general"],
  ["finale", "section[aria-labelledby=finale-title]", "general"],
  ["footer", "footer", "general"],
  ["mobile sticky bar", "[data-sticky-cta]", "general"],
];

for (const locale of ["fa", "en", "de", "tr"]) {
  test(`/${locale}: every WhatsApp button opens the clinic chat with its context message`, async ({ page }) => {
    await page.goto(`/${locale}`);
    for (const [name, selector, context] of placements) {
      const link = page.locator(selector).locator('a[href^="https://wa.me/"]').first();
      const href = await link.getAttribute("href");
      expect(href, name).toMatch(/^https:\/\/wa\.me\/905427130132\?text=/);
      expect(new URL(href!).searchParams.get("text"), name).toBe(messages(locale)[context]);
      await expect(link, name).toHaveAttribute("target", "_blank");
      await expect(link, name).toHaveAttribute("rel", /noopener/);
    }
  });
}
