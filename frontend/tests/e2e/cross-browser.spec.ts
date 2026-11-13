import { expect, test } from "@playwright/test";

// H01 — the core journeys in every engine and on phones (projects: chromium, firefox, webkit, iphone, android).
// Engines without real devices; VoiceOver/TalkBack and physical-device passes remain manual (NOT RUN here).
test("home: heading and both hero calls to action are on screen, in Persian and English", async ({ page }) => {
  for (const [locale, cta] of [
    ["fa", "درخواست مشاوره رایگان"],
    ["en", "Request a free consultation"],
  ] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "fa" ? "rtl" : "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("section[aria-labelledby=hero-title]").getByRole("link", { name: cta })).toBeInViewport();
  }
});

test("a treatment page opens its questions one at a time", async ({ page }) => {
  await page.goto("/de/zahnimplantate");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Zahnimplantate");
  const faq = page.locator("section[aria-labelledby=faq-title]");
  await faq.locator("summary").first().click();
  await expect(faq.locator("details").first()).toHaveAttribute("open", "");
  await faq.locator("summary").nth(1).click();
  await expect(faq.locator("details").first()).not.toHaveAttribute("open", "");
});

test("the consultation form sends a request and shows the reference", async ({ page }) => {
  await page.goto("/en/free-consultation");
  const form = page.locator("form#consultation-form").filter({ visible: true });
  await expect(form.locator("[name=submission_id]")).not.toHaveValue("");
  await form.locator("[name=full_name]").fill(`Engine Check ${test.info().project.name}`);
  await form.locator("[name=country]").selectOption("DE");
  await form.locator("[name=phone]").fill("0151 1234 5678");
  await form.locator("[name=treatment]").nth(1).check({ force: true });
  await form.locator("[name=consent]").check();
  await form.getByRole("button", { name: "Send request" }).click();
  await expect(page.locator("[data-lead-success] [data-reference]")).toHaveText(/^JD-[0-9A-Z]{6}$/); // mock or real API
});

test("the language switcher keeps the page", async ({ page }) => {
  await page.goto("/en/smile-design");
  await page.getByRole("banner").getByRole("button", { name: /Language/ }).click();
  await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "Türkçe" }).click();
  await expect(page).toHaveURL(/\/tr\/gulus-tasarimi$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gülüş tasarımı");
});

test("phones: the menu is a modal dialog and nothing overflows sideways", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone projects only");
  await page.goto("/fa");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "منو" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test.describe("hero film", () => {
  test.use({ reducedMotion: "no-preference" });
  test("the smile film plays to its end in this engine", async ({ page }) => {
    await page.goto("/en");
    const video = page.locator("[data-hero-film] video");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.ended || document.querySelector("[data-hero-film]")!.hasAttribute("data-still")), { timeout: 15_000 }).toBe(true);
    expect(await video.evaluate((v: HTMLVideoElement) => v.error?.code ?? 0), "decode error").toBe(0);
    expect(await page.locator("[data-hero-film]").getAttribute("data-still"), "autoplay refused").toBeNull();
  });
});
