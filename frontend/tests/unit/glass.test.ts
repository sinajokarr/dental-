import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
const utility = (name: string): string => {
  const start = css.indexOf(`@utility ${name} {`);
  assert.ok(start >= 0, `@utility ${name} missing`);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    depth += css[i] === "{" ? 1 : css[i] === "}" ? -1 : 0;
    if (depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`unbalanced ${name}`);
};

for (const name of ["glass-nav", "glass-card", "glass-strong", "glass-dark"]) {
  test(`${name}: blur with Safari prefix, opaque fallbacks (no backdrop-filter, reduced transparency)`, () => {
    const body = utility(name);
    assert.match(body, /-webkit-backdrop-filter:\s*blur\(/);
    assert.match(body, /\bbackdrop-filter:\s*blur\(/);
    assert.match(body, /@supports not/);
    assert.match(body, /prefers-reduced-transparency:\s*reduce/);
  });
}

test("glass-card and porcelain-edge draw the gradient porcelain edge", () => {
  for (const name of ["glass-card", "porcelain-edge"]) assert.match(utility(name), /border-box/);
});
