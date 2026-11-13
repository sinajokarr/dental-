import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source of truth: docs/DESIGN_SYSTEM.md. Changing a token there means changing it here and in globals.css.
const TOKENS: Record<string, string> = {
  "--color-white": "#ffffff",
  "--color-ivory": "#fcfbf9",
  "--color-ice-50": "#f7f4f0",
  "--color-ice-100": "#f1ece5",
  "--color-sky-100": "#ece4da",
  "--color-sky-200": "#e5d9ce",
  "--color-sky-400": "#ccbba9",
  "--color-mist": "#dce3eb",
  "--color-navy-900": "#273447",
  "--color-navy-800": "#2f3d54",
  "--color-blue-700": "#3c4c66",
  "--color-band": "#3c4c66",
  "--color-muted-blue": "#5b6d87",
  "--color-slate-600": "#586679",
  "--color-slate-500": "#77859a",
  "--color-red-700": "#b42318",
  "--color-green-700": "#0d7254",
  "--color-dark-muted": "#e5d9ce",
  "--color-dark-error": "#ffa49b",
  "--color-whatsapp": "#25d366",
  "--radius-sm": "14px",
  "--radius-md": "22px",
  "--radius-lg": "32px",
};

const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");

test("globals.css declares every DESIGN_SYSTEM color and radius token", () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    assert.match(css, new RegExp(`${name}:\\s*${value};`, "i"), `${name} should be ${value}`);
  }
});

test("only brand colors exist: Tailwind's default palette is disabled", () => {
  assert.match(css, /--color-\*:\s*initial;/);
});

test("elevation, easing and section spacing tokens exist", () => {
  for (const name of ["--shadow-e1", "--shadow-e2", "--shadow-e3", "--shadow-glow", "--ease-out", "--ease-in-out", "--spacing-section"]) {
    assert.match(css, new RegExp(`${name.replace("*", "\\*")}:`), `${name} missing`);
  }
});
