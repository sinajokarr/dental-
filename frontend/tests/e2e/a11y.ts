import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Axe on the final, settled content — what a reader sees once each section has revealed.
 * Reduced motion makes every reveal/journey state final (CSS media queries and gsap.matchMedia revert);
 * then one-shot animations are awaited so contrast is judged at full opacity.
 */
export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState === "finished"));
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
}
