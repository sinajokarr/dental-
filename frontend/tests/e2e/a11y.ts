import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Axe on the settled page: waits for one-shot entrance animations, so contrast is judged at full opacity. */
export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState === "finished"));
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
}
