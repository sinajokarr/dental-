import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { routing } from "../../src/i18n/routing.ts";

type Messages = { [key: string]: string | Messages };

const flatten = (messages: Messages, prefix = ""): [string, string][] =>
  Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string" ? [[prefix + key, value]] : flatten(value, `${prefix}${key}.`),
  );

const load = (locale: string): [string, string][] =>
  flatten(JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8")));

test("every locale has exactly the message keys of en.json", () => {
  const reference = load("en").map(([key]) => key).sort();
  for (const locale of routing.locales) {
    assert.deepEqual(load(locale).map(([key]) => key).sort(), reference, `${locale}.json differs from en.json`);
  }
});

test("no message is empty", () => {
  for (const locale of routing.locales) {
    for (const [key, value] of load(locale)) assert.ok(value.trim(), `${locale}.json: "${key}" is empty`);
  }
});
