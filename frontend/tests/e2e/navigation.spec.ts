import { expect, test } from "@playwright/test";

test("skip link is the first focusable element and targets main", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");
  const skip = page.locator(":focus");
  await expect(skip).toHaveAttribute("href", "#main");
  await expect(page.locator("main#main")).toHaveCount(1);
});

test("language switcher offers every other locale with native names, lang and hreflang (no flags)", async ({ page }) => {
  await page.goto("/de");
  await page.getByRole("button", { name: /Sprache/ }).click();
  const links = page.getByRole("navigation", { name: "Sprache" }).getByRole("link");
  await expect(links).toHaveCount(4);
  for (const [locale, name] of [["fa", "فارسی"], ["en", "English"], ["de", "Deutsch"], ["tr", "Türkçe"]]) {
    const link = page.getByRole("navigation", { name: "Sprache" }).getByRole("link", { name });
    await expect(link).toHaveAttribute("hreflang", locale);
    await expect(link).toHaveAttribute("lang", locale);
    await expect(link).toHaveAttribute("href", `/${locale}`);
  }
});

test("language menu opens on the same side as its button, in LTR and RTL", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [locale, label] of [["en", "Language"], ["fa", "زبان"]]) {
    await page.goto(`/${locale}`);
    const button = page.getByRole("button", { name: new RegExp(`^${label}`) }).filter({ visible: true }).first();
    await button.click();
    const menu = page.getByRole("navigation", { name: label, exact: true });
    await expect(menu).toBeVisible();
    const [b, m] = [await button.boundingBox(), await menu.boundingBox()];
    const middle = 1440 / 2;
    const side = (box: { x: number; width: number }) => box.x + box.width / 2 > middle;
    expect(side(m!), `${locale}: menu and button on the same side`).toBe(side(b!));
    expect(m!.x >= 0 && m!.x + m!.width <= 1440, `${locale}: menu inside the viewport`).toBe(true);
    // …and directly under the button: end edges aligned, top just below it.
    const endGap = locale === "fa" ? m!.x - b!.x : m!.x + m!.width - (b!.x + b!.width);
    expect(Math.abs(endGap), `${locale}: menu end edge under the button's end edge`).toBeLessThan(2);
    expect(m!.y - (b!.y + b!.height), `${locale}: menu just below the button`).toBeGreaterThanOrEqual(0);
    expect(m!.y - (b!.y + b!.height), `${locale}: menu just below the button`).toBeLessThan(16);
    await page.keyboard.press("Escape");
  }
});

test("treatments menu opens from the keyboard and links to localized slugs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tr");
  const trigger = page.getByRole("button", { name: "Tedaviler" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const panel = page.locator("#treatments-menu");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: /Diş İmplantı/ })).toHaveAttribute("href", "/tr/dis-implanti");
  await expect(panel.getByRole("link", { name: /Porselen Lamina/ })).toHaveAttribute("href", "/tr/porselen-lamina");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});

test("mobile menu opens as a modal dialog, closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/fa");
  const open = page.getByRole("button", { name: "منو" });
  await open.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "مشاوره رایگان" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test("WhatsApp link opens the clinic chat with a localized message in a new tab", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/de");
  const link = page.getByRole("banner").getByRole("link", { name: "Per WhatsApp schreiben" });
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/905427130132\?text=/);
  expect(decodeURIComponent(href!.split("text=")[1])).toContain("kostenlose Beratung");
  await expect(link).toHaveAttribute("target", "_blank");
});
