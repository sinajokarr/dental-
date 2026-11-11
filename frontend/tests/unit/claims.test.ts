import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Claims Policy guard (INTERNATIONAL_PATIENT_FUNNEL §3, D-062): copy may not promise what the clinic has not
// confirmed — prices, rankings, painless treatment, patient counts or years, unconditional guarantees, languages
// beyond the four of the site. Fails with the message key, so a reviewer sees exactly what to fix.
type Locale = "fa" | "en" | "de" | "tr";
const FORBIDDEN: Record<Locale | "all", RegExp[]> = {
  all: [/[€$£₺]/, /\b(EUR|USD|GBP|TRY)\b/],
  en: [/\b(best|cheapest|number one|#1|top-rated|world-class|leading)\b/i, /pain-?free|painless/i, /\d+\+?\s*(patients|years)/i, /lifetime|permanent result/i, /\b(Arabic|Russian|French|Spanish|Italian)\b/],
  de: [/\b(beste[nrs]?|günstigste[nrs]?|Nr\.\s?1|führende[nrs]?)\b/i, /schmerzfrei/i, /\d+\+?\s*(Patienten|Jahre)/i, /lebenslang/i, /\b(Arabisch|Russisch|Französisch|Spanisch)\b/],
  tr: [/\ben iyi\b|\ben ucuz\b|1 numara/i, /ağrısız/i, /\d+\+?\s*(hasta|yıl)/i, /ömür boyu/i, /\b(Arapça|Rusça|Fransızca|İspanyolca)\b/],
  fa: [/بهترین|ارزان‌ترین|شماره ۱|برترین/, /بدون درد/, /[\d۰-۹]+\+?\s*(بیمار|سال)/, /مادام‌العمر|دائمی/, /عربی|روسی|فرانسوی|اسپانیایی/],
};
// A guarantee may be mentioned only together with "its terms depend on the treatment" (D-062).
const GUARANTEE: Record<Locale, [RegExp, RegExp]> = {
  en: [/guarantee/i, /depend/i],
  de: [/garantie/i, /hängen .*ab/i],
  tr: [/garanti/i, /göre değişir/i],
  fa: [/ضمانت|تضمین/, /بستگی دارد/],
};

export function violations(messages: unknown, locale: Locale, path = ""): string[] {
  if (typeof messages === "string") {
    const found = [...FORBIDDEN.all, ...FORBIDDEN[locale]].filter((rule) => rule.test(messages)).map((rule) => `${path}: ${rule}`);
    const [word, condition] = GUARANTEE[locale];
    const question = path.endsWith(".q"); // asking about a guarantee is not promising one; the answer is checked
    if (word.test(messages) && !condition.test(messages) && !question) found.push(`${path}: guarantee without "depends on the treatment"`);
    return found;
  }
  if (messages && typeof messages === "object")
    return Object.entries(messages).flatMap(([key, value]) => violations(value, locale, path ? `${path}.${key}` : key));
  return [];
}

test("the guard itself catches each kind of claim", () => {
  assert.equal(violations({ a: "The best clinic in town" }, "en").length, 1);
  assert.equal(violations({ a: "Prices from €900" }, "en").length, 1);
  assert.equal(violations({ a: "Over 5000 patients" }, "en").length, 1);
  assert.equal(violations({ a: "A guarantee on every implant." }, "en").length, 1);
  assert.equal(violations({ a: "A guarantee applies; its terms depend on the treatment." }, "en").length, 0);
  assert.equal(violations({ a: "درمان بدون درد" }, "fa").length, 1);
  assert.equal(violations({ a: "Tedavilerimiz garantilidir." }, "tr").length, 1);
  assert.equal(violations({ a: "Schmerzfreie Behandlung" }, "de").length, 1);
  assert.equal(violations({ items: [{ q: "Is there a guarantee?" }] }, "en").length, 0);
});

for (const locale of ["fa", "en", "de", "tr"] as const) {
  test(`${locale}: every message respects the Claims Policy`, () => {
    const messages = JSON.parse(readFileSync(new URL(`../../messages/${locale}.json`, import.meta.url), "utf8"));
    assert.deepEqual(violations(messages, locale), []);
  });
}
