import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Four-language parity of the confirmed facts (V6 §7.2): a fact stated under a message key in one language is stated
// under the same key in the other three. Key parity is messages.test.ts; this guards the meaning that matters most.
type Messages = { [key: string]: string | Messages };
const flatten = (messages: Messages, prefix = ""): [string, string][] =>
  Object.entries(messages).flatMap(([key, value]) => (typeof value === "string" ? [[prefix + key, value]] : flatten(value, `${prefix}${key}.`)));
const load = (locale: string) => flatten(JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8")));

const FACTS: Record<string, Record<string, RegExp>> = {
  "the 3 to 8 day stay": { en: /3 to 8 days/, fa: /۳ تا ۸ روز/, de: /3 bis 8 Tage/, tr: /3 ila 8 gün/ },
  "the conditional guarantee": { en: /guarantee/i, fa: /ضمانت/, de: /garantie/i, tr: /garanti/i },
  "local anaesthesia": { en: /local anaesthesia/i, fa: /بی‌حسی موضعی/, de: /örtlicher Betäubung/i, tr: /lokal anestezi/i },
  "titanium": { en: /titanium/i, fa: /تیتانیوم/, de: /Titan/, tr: /titanyum/i },
  "cannot be undone": { en: /cannot be undone/i, fa: /برگشت‌پذیر نیست/, de: /nicht rückgängig/i, tr: /geri alınamaz/i },
};

for (const [fact, rules] of Object.entries(FACTS)) {
  test(`${fact} is stated under the same message keys in all four languages`, () => {
    const keys = (locale: string) => load(locale).filter(([, value]) => rules[locale].test(value)).map(([key]) => key).sort();
    const reference = keys("en");
    assert.ok(reference.length > 0, `en.json never states ${fact}`);
    for (const locale of ["fa", "de", "tr"]) assert.deepEqual(keys(locale), reference, `${locale}.json states ${fact} under different keys than en.json`);
  });
}
