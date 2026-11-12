import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source of truth: docs/DESIGN_SYSTEM.md. Changing a token there means changing it here and in globals.css.
const TOKENS: Record<string, string> = {
  "--color-white": "#ffffff",
  "--color-ice-50": "#f8f5f3",
  "--color-ice-100": "#f5f2ee",
  "--color-sky-100": "#f1ede8",
  "--color-sky-200": "#e8e0d8",
  "--color-sky-400": "#cbbaa8",
  "--color-navy-900": "#263242",
  "--color-navy-800": "#2f3e51",
  "--color-blue-700": "#3b4d65",
  "--color-slate-600": "#58687c",
  "--color-slate-500": "#7a8696",
  "--color-red-700": "#b42318",
  "--color-green-700": "#0e7a5a",
  "--color-dark-muted": "#dbcfc2",
  "--color-dark-error": "#ff8a80",
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
