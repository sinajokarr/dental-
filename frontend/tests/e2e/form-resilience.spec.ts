import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

// E07 — the form when the lead API is slow, failing or unreachable (API_SPEC §3; Telegram outages are covered by
// Django's notification tests: a lead is stored before any send). Mock behaviour: tests/e2e/mock-lead-api.mjs.
const MOCK = "http://127.0.0.1:3199";
const unique = (name: string) => `${name} ${Math.random().toString(36).slice(2, 8)}`;
type Recorded = { body: { full_name: string; submission_id: string } };
const received = async (request: APIRequestContext, name: string) =>
  ((await (await request.get(`${MOCK}/__requests`)).json()) as Recorded[]).filter((r) => r.body.full_name === name);

async function send(page: Page, name: string) {
  await page.goto("/en");
  const f = page.locator("form#consultation-form");
  await expect(f.locator("[name=submission_id]")).not.toHaveValue("");
  await f.locator("[name=full_name]").fill(name);
  await f.locator("[name=country]").selectOption("GB");
  await f.locator("[name=phone]").fill("07911 123456");
  await f.locator("[name=treatment]").first().check({ force: true });
  await f.locator("[name=consent]").check();
  await f.getByRole("button", { name: "Send request" }).click();
  return f;
}

test("a timed-out request is retried without creating a second lead", async ({ page, request }) => {
  test.setTimeout(60_000);
  const name = unique("Slow Server");
  const f = await send(page, name);
  await expect(f.getByRole("alert")).toContainText("We could not reach our server", { timeout: 15_000 });
  await expect(f.locator("[name=full_name]")).toHaveValue(name);
  await page.waitForTimeout(1_500); // meanwhile the slow API finished storing the lead
  await f.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator("[data-lead-success] [data-reference]")).toHaveText(/^JD-E2E\d{3}$/);
  const sent = await received(request, name);
  expect(sent).toHaveLength(2);
  expect(sent[1].body.submission_id).toBe(sent[0].body.submission_id); // the same lead, replayed
});

test("a server error offers a retry that succeeds with the same submission", async ({ page, request }) => {
  const name = unique("Flaky");
  const f = await send(page, name);
  await expect(f.getByRole("alert")).toContainText("Something went wrong on our side");
  await f.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator("[data-lead-success]")).toBeVisible();
  const sent = await received(request, name);
  expect(sent.map((r) => r.body.submission_id)).toEqual([sent[0].body.submission_id, sent[0].body.submission_id]);
});

test("a dropped connection is retried once, then the visitor is told and offered WhatsApp", async ({ page, request }) => {
  const name = unique("Connection Drop");
  const f = await send(page, name);
  const alert = f.getByRole("alert");
  await expect(alert).toContainText("We could not reach our server");
  await expect(alert.locator('a[href^="https://wa.me/"]')).toBeVisible();
  const sent = await received(request, name);
  expect(sent).toHaveLength(2); // one automatic retry
  expect(sent[1].body.submission_id).toBe(sent[0].body.submission_id);
});
