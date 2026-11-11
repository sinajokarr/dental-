import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPhone, telLink, waLink } from "../../src/lib/whatsapp.ts";

test("builds a wa.me link with the URL-encoded prefilled message", () => {
  const text = "سلام، وقت بخیر. مایل به دریافت مشاوره رایگان درباره ایمپلنت دندان هستم.";
  assert.equal(waLink(text, "905427130132"), `https://wa.me/905427130132?text=${encodeURIComponent(text)}`);
});

test("rejects a number that is not international digits only", () => {
  for (const bad of ["+905427130132", "90 542 713 01 32", "", "0542713"]) {
    assert.throws(() => waLink("hi", bad), /international digits/);
  }
});

test("the same number is callable: tel link and readable international format (D-062)", () => {
  assert.equal(telLink("905427130132"), "tel:+905427130132");
  assert.equal(formatPhone("905427130132"), "+90 542 713 01 32");
  assert.equal(formatPhone("4915112345678"), "+4915112345678");
  assert.throws(() => telLink("+90 542"), /international digits/);
});
