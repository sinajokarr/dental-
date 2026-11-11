import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// LEAD_MANAGEMENT_AND_FORM_SPEC §2–5, §11. The Server Action posts to the contract mock (playwright.config.ts).
const MOCK = "http://127.0.0.1:3199";
const unique = (name: string) => `${name} ${Math.random().toString(36).slice(2, 8)}`;
type Recorded = { body: Record<string, unknown> & { full_name: string; submission_id: string }; clientIp: string | null };
const received = async (request: APIRequestContext, name: string) =>
  ((await (await request.get(`${MOCK}/__requests`)).json()) as Recorded[]).filter((r) => r.body.full_name === name);

const form = (page: Page) => page.locator("form#consultation-form");

/** With JavaScript, wait until React owns the form (the browser-made idempotency key is in place). */
const hydrated = (page: Page) => expect(form(page).locator("[name=submission_id]")).not.toHaveValue("");

async function fillValid(page: Page, name: string, { country = "TR", phone = "0542 713 01 32", treatment = 0, js = true } = {}) {
  const f = form(page);
  if (js) await hydrated(page);
  await f.locator("[name=full_name]").fill(name);
  await f.locator("[name=country]").selectOption(country);
  await f.locator("[name=phone]").fill(phone);
  await f.locator("[name=treatment]").nth(treatment).check({ force: true });
  await f.locator("[name=consent]").check();
}

test("five required fields up front, preferences folded away, honeypot hidden from people and assistive tech", async ({ page }) => {
  await page.goto("/en");
  const f = form(page);
  for (const name of ["full_name", "country", "phone", "consent"]) await expect(f.locator(`[name=${name}]`)).toBeVisible();
  await expect(f.locator("[name=treatment]")).toHaveCount(4);
  await expect(f.locator("details")).not.toHaveAttribute("open", "");
  await expect(f.locator("[name=website]")).not.toBeInViewport();
  await expect(f.locator("[name=website]")).toHaveAttribute("tabindex", "-1");
});

test("an empty submit lists every problem in a focused summary and marks the fields", async ({ page }) => {
  await page.goto("/en");
  await hydrated(page);
  await form(page).getByRole("button", { name: "Send request" }).click();
  const summary = form(page).locator("[data-error-summary]");
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Please check 5 fields");
  await expect(form(page).locator("[name=full_name]")).toHaveAttribute("aria-invalid", "true");
  await expect(form(page).locator("#lead-full-name-error")).toHaveText("Please fill in this field.");
  await summary.getByRole("link", { name: /Full name/ }).click();
  await expect(form(page).locator("[name=full_name]")).toBeFocused();
});

test("choosing a country fills the phone code, unless the visitor chose a code themselves", async ({ page }) => {
  await page.goto("/de");
  await hydrated(page);
  const f = form(page);
  await f.locator("[name=country]").selectOption("DE");
  await expect(f.locator("[name=phone_code]")).toHaveValue("DE");
  await f.locator("[name=phone_code]").selectOption("TR");
  await f.locator("[name=country]").selectOption("GB");
  await expect(f.locator("[name=phone_code]")).toHaveValue("TR");
});

for (const [locale, button, title] of [
  ["fa", "ارسال درخواست", "درخواست شما ثبت شد"],
  ["en", "Send request", "Your request has been received"],
  ["de", "Anfrage senden", "Ihre Anfrage ist eingegangen"],
  ["tr", "Talebi gönder", "Talebiniz alındı"],
] as const) {
  test(`/${locale}: a valid request is sent and the reference is shown with a WhatsApp follow-up`, async ({ page, request }) => {
    await page.goto(`/${locale}?utm_source=e2e&utm_campaign=form`);
    const name = unique("Form Patient");
    await fillValid(page, name);
    await form(page).getByRole("button", { name: button }).click();
    const panel = page.locator("[data-lead-success]");
    await expect(panel.getByRole("heading", { name: title })).toBeFocused();
    const reference = (await panel.locator("[data-reference]").textContent())!;
    expect(reference).toMatch(/^JD-E2E\d{3}$/);
    const wa = new URL((await panel.locator('a[href^="https://wa.me/"]').getAttribute("href"))!);
    expect(wa.searchParams.get("text")).toContain(reference);

    const [sent] = await received(request, name);
    expect(sent.body).toMatchObject({
      country: "TR",
      phone: "+905427130132",
      treatment: "implants",
      site_locale: locale,
      preferred_language: locale,
      preferred_contact: "whatsapp",
      preferred_city: "no_preference",
      consent: true,
      consent_version: "draft-1",
      source_page: `/${locale}`,
      utm: { source: "e2e", campaign: "form" },
    });
    expect(sent.body.submission_id).toMatch(/^[0-9a-f-]{36}$/);
  });
}

test("a field error from the server shows under its field and keeps everything typed", async ({ page }) => {
  await page.goto("/en");
  const name = unique("Invalid Phone");
  await fillValid(page, name);
  await form(page).getByRole("button", { name: "Send request" }).click();
  await expect(form(page).locator("#lead-phone-error")).toHaveText("Please enter a valid phone number.");
  await expect(form(page).locator("[name=full_name]")).toHaveValue(name);
  await expect(form(page).locator("[name=phone]")).toHaveValue("0542 713 01 32");
  await expect(form(page).locator("[name=country]")).toHaveValue("TR");
  await expect(form(page).locator("[name=phone_code]")).toHaveValue("TR");
  await expect(form(page).locator("[name=consent]")).toBeChecked();
  await expect(form(page).locator("[data-error-summary]")).toContainText("Please check 1 field"); // only the server's error
});

test("too many requests: an alert explains it and offers WhatsApp", async ({ page }) => {
  await page.goto("/en");
  await fillValid(page, unique("Rate Limited"));
  await form(page).getByRole("button", { name: "Send request" }).click();
  const alert = form(page).getByRole("alert");
  await expect(alert).toContainText("Too many requests");
  await expect(alert.locator('a[href^="https://wa.me/"]')).toBeVisible();
  await expect(form(page).locator("[name=country]")).toHaveValue("TR"); // nothing typed is lost
});

test("email contact makes the email field required", async ({ page }) => {
  await page.goto("/en");
  await fillValid(page, unique("Email Contact"));
  await form(page).locator("details summary").click();
  await form(page).locator("[name=preferred_contact][value=email]").check({ force: true });
  await form(page).getByRole("button", { name: "Send request" }).click();
  await expect(form(page).locator("#lead-email-error")).toHaveText("Please enter your email so we can reply by email.");
});

test("the form works without JavaScript", async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en");
  const name = unique("No JS Patient");
  await fillValid(page, name, { js: false });
  await form(page).getByRole("button", { name: "Send request" }).click();
  await expect(page.locator("[data-lead-success] [data-reference]")).toHaveText(/^JD-E2E\d{3}$/);
  expect(await received(request, name)).toHaveLength(1);
  await context.close();
});

test("a filled honeypot gets a success screen but nothing reaches the API", async ({ page, request }) => {
  await page.goto("/en");
  const name = unique("Honeypot Bot");
  await fillValid(page, name);
  await form(page).locator("[name=website]").evaluate((input: HTMLInputElement) => (input.value = "https://spam.example"));
  await form(page).getByRole("button", { name: "Send request" }).click();
  await expect(page.locator("[data-lead-success]")).toBeVisible();
  expect(await received(request, name)).toHaveLength(0);
});

test("the form with errors has no serious accessibility violations", async ({ page }) => {
  await page.goto("/fa");
  await hydrated(page);
  await form(page).getByRole("button", { name: "ارسال درخواست" }).click();
  await expect(form(page).locator("[data-error-summary]")).toBeFocused();
  await expectNoSeriousA11yViolations(page);
});
