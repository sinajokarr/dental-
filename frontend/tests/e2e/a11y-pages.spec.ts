import { test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// H02 — axe on every page type, right-to-left and left-to-right (fa/en slugs equal the internal paths).
// Manual keyboard and screen-reader passes (VoiceOver, NVDA, TalkBack) are not automated: NOT RUN.
const PATHS = ["", "/dental-implants", "/dental-veneers", "/smile-design", "/international-patients", "/free-consultation", "/about", "/privacy", "/kvkk", "/legal-notice", "/no-such-page"];

for (const locale of ["fa", "en"]) {
  for (const path of PATHS) {
    test(`/${locale}${path || " (home)"}: no serious or critical accessibility violations`, async ({ page }) => {
      await page.goto(`/${locale}${path}`);
      await expectNoSeriousA11yViolations(page);
    });
  }
}
