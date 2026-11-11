import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
const token = (name: string): string => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6});`, "i"));
  assert.ok(match, `--color-${name} missing`);
  return match[1];
};

// WCAG 2.x relative luminance contrast ratio.
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("contrast() matches known WCAG values", () => {
  assert.equal(contrast("#000000", "#ffffff").toFixed(2), "21.00");
  assert.equal(contrast("#777777", "#ffffff").toFixed(2), "4.48");
});

// [foreground, backgrounds, minimum] — DESIGN_SYSTEM.md §1 (text 4.5:1, UI boundaries 3:1).
const LIGHT = ["white", "ice-50", "ice-100", "sky-100"];
const NAVY = ["navy-900", "navy-800"];
const PAIRS: [string, string[], number][] = [
  ["navy-900", LIGHT, 4.5],
  ["navy-800", LIGHT, 4.5],
  ["slate-600", LIGHT, 4.5],
  ["blue-700", LIGHT, 4.5],
  ["red-700", LIGHT, 4.5],
  ["green-700", LIGHT, 4.5],
  ["white", ["blue-700", "navy-800", "navy-900"], 4.5],
  ["slate-500", ["white", "ice-50", "ice-100"], 3],
  ["white", NAVY, 4.5],
  ["dark-muted", NAVY, 4.5],
  ["sky-400", NAVY, 4.5],
  ["dark-error", NAVY, 4.5],
];

test("every DESIGN_SYSTEM text/background pair meets WCAG AA", () => {
  for (const [fg, backgrounds, min] of PAIRS) {
    for (const bg of backgrounds) {
      const ratio = contrast(token(fg), token(bg));
      assert.ok(ratio >= min, `${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
    }
  }
});
