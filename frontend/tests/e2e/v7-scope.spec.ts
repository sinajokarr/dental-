import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// V7 scope lock: the expansion of the implant and smile-design pages must not change anything else. The server-rendered
// HTML of each protected region is hashed and compared with the baseline recorded before V7 began (V7_BASELINE=1 records).
// The baseline was recorded from a production build of the pre-V7 commit (af42efe). Protected: both treatment heroes (text, film, poster, layout), the whole veneers page, the home page, header and footer.
const FILE = "tests/e2e/baselines/v7-scope.json"; // run from frontend/, like every npm script
const record = process.env.V7_BASELINE === "1";
const baseline: Record<string, string> = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {};

const between = (html: string, open: string, close: string) => {
  const start = html.indexOf(open);
  expect(start, `${open} is in the page`).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf(close, start) + close.length);
};
// The form's hidden server-action id and key are generated per build (never visible): compared without their values.
const normalise = (s: string) => s.replace(/(name="\$ACTION_[^"]*" value=")[^"]*"/g, '$1"');
const hash = (s: string) => createHash("sha256").update(normalise(s)).digest("hex");

const REGIONS: { name: string; path: string; open: string; close: string }[] = [];
for (const [locale, implants, smile, veneers] of [
  ["fa", "dental-implants", "smile-design", "dental-veneers"],
  ["en", "dental-implants", "smile-design", "dental-veneers"],
  ["de", "zahnimplantate", "smile-design", "veneers"],
  ["tr", "dis-implanti", "gulus-tasarimi", "porselen-lamina"],
]) {
  REGIONS.push({ name: `${locale} implants hero`, path: `/${locale}/${implants}`, open: '<section aria-labelledby="page-title"', close: "</section>" });
  REGIONS.push({ name: `${locale} smile-design hero`, path: `/${locale}/${smile}`, open: '<section aria-labelledby="page-title"', close: "</section>" });
  REGIONS.push({ name: `${locale} veneers page`, path: `/${locale}/${veneers}`, open: "<main", close: "</main>" });
  REGIONS.push({ name: `${locale} home page`, path: `/${locale}`, open: "<main", close: "</main>" });
  REGIONS.push({ name: `${locale} header`, path: `/${locale}`, open: "<header", close: "</header>" });
  REGIONS.push({ name: `${locale} footer`, path: `/${locale}`, open: "<footer", close: "</footer>" });
}

for (const region of REGIONS) {
  test(`unchanged by V7: ${region.name}`, async ({ request }) => {
    const response = await request.get(region.path);
    expect(response.status(), region.path).toBe(200);
    const value = hash(between(await response.text(), region.open, region.close));
    if (record) baseline[region.name] = value;
    else expect(value, `${region.name} (${region.path}) differs from the pre-V7 baseline`).toBe(baseline[region.name]);
  });
}

test.afterAll(() => {
  if (!record) return;
  mkdirSync("tests/e2e/baselines", { recursive: true });
  writeFileSync(FILE, JSON.stringify(baseline, null, 1) + "\n");
});
