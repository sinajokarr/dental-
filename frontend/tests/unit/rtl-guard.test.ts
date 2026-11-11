import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

// Physical left/right utilities and CSS properties break the Persian (RTL) layout.
// Use logical ones instead: ms-/me-/ps-/pe-/start-/end-/border-s/rounded-s/text-start, margin-inline-start …
// ponytail: regex heuristic over class strings and CSS; a false positive on prose ("left-hand") means rewording it.
const PHYSICAL = new RegExp(
  [
    String.raw`(?<![\w-])-?(?:scroll-)?[mp][lr]-`, // ml- pr- -mr- scroll-ml-
    String.raw`(?<![\w-])(?:left|right)-`, // left-0 right-4
    String.raw`(?<![\w-])(?:border|rounded)-(?:[lr]|[tb][lr])\b`, // border-l rounded-tr
    String.raw`(?<![\w-])(?:text|float|clear)-(?:left|right)\b`, // text-right float-left
    String.raw`(?<![\w-])(?:margin|padding|border)-(?:left|right)\b`, // CSS margin-left
    String.raw`(?<![\w-])(?:left|right)\s*:`, // CSS left: 0
    String.raw`text-align:\s*(?:left|right)`,
  ].join("|"),
  "g",
);

const physical = (text: string): string[] => text.match(PHYSICAL) ?? [];
const SRC = new URL("../../src/", import.meta.url);

test("detector flags physical utilities and properties", () => {
  const samples = [
    'className="ml-4"', 'className="md:-mr-2"', '"pl-3 pr-3"', '"left-0"', '"right-4"', '"border-l-2"',
    '"rounded-tr-lg"', '"text-right"', '"float-left"', "margin-left: 1rem", "left: 0;", "text-align: right",
  ];
  for (const sample of samples) assert.ok(physical(sample).length, `should flag: ${sample}`);
});

test("detector allows logical utilities and lookalikes", () => {
  const samples = [
    'className="ms-4 me-2 ps-3 pe-3 start-0 end-0"', '"border-s-2 rounded-se-lg text-start"', '"rounded-lg"',
    "<html lang>", "copyright", "margin-inline-start: 1rem",
  ];
  for (const sample of samples) assert.deepEqual(physical(sample), [], `should allow: ${sample}`);
});

test("source code uses no physical left/right", () => {
  const files = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((file) => /\.(tsx?|css)$/.test(file));
  const hits = files.flatMap((file) => physical(readFileSync(new URL(file, SRC), "utf8")).map((m) => `${file}: ${m}`));
  assert.deepEqual(hits, []);
});
