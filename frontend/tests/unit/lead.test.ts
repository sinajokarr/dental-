import assert from "node:assert/strict";
import { test } from "node:test";
import { COUNTRIES } from "../../src/lib/countries.ts";
import { toFormState } from "../../src/lib/lead-response.ts";
import { readLead, toInternational, validateLead, type LeadInput } from "../../src/lib/validate-lead.ts";

// --- countries.ts: generated from phonenumbers (D-048), one source for server and client.
test("countries: every phonenumbers region with its calling code", () => {
  const map = new Map(COUNTRIES);
  assert.equal(COUNTRIES.length, 245);
  assert.equal(map.get("TR"), 90);
  assert.equal(map.get("DE"), 49);
  assert.equal(map.get("GB"), 44);
  assert.equal(map.get("IR"), 98);
});

// --- validateLead: the same light checks run in the browser and in the Server Action; Django is the reference.
const valid: LeadInput = {
  full_name: "Max Mustermann", country: "DE", phone_code: "DE", phone: "0151 1234 5678", treatment: "implants",
  consent: true, preferred_contact: "whatsapp", email: "", preferred_city: "no_preference", preferred_language: "de", message: "",
};
const errorsOf = (patch: Partial<LeadInput>) => validateLead({ ...valid, ...patch });

test("validateLead accepts a complete request", () => assert.deepEqual(validateLead(valid), {}));

test("validateLead: required fields and lengths", () => {
  assert.deepEqual(errorsOf({ full_name: "  " }), { full_name: "required" });
  assert.deepEqual(errorsOf({ full_name: " M " }), { full_name: "too_short" });
  assert.deepEqual(errorsOf({ full_name: "x".repeat(121) }), { full_name: "too_long" });
  assert.deepEqual(errorsOf({ country: "" }), { country: "required" });
  assert.deepEqual(errorsOf({ country: "ZZ" }), { country: "invalid_choice" });
  assert.deepEqual(errorsOf({ phone: "" }), { phone: "required" });
  assert.deepEqual(errorsOf({ phone: "12" }), { phone: "invalid_phone" });
  assert.deepEqual(errorsOf({ phone_code: "ZZ" }), { phone: "invalid_phone" });
  assert.deepEqual(errorsOf({ treatment: "" }), { treatment: "required" });
  assert.deepEqual(errorsOf({ treatment: "whitening" }), { treatment: "invalid_choice" });
  assert.deepEqual(errorsOf({ consent: false }), { consent: "consent_required" });
  assert.deepEqual(errorsOf({ message: "x".repeat(1001) }), { message: "too_long" });
});

test("validateLead: email only when email contact is chosen, and then a real address", () => {
  assert.deepEqual(errorsOf({ preferred_contact: "email" }), { email: "email_required" });
  assert.deepEqual(errorsOf({ preferred_contact: "email", email: "max@" }), { email: "invalid_email" });
  assert.deepEqual(errorsOf({ preferred_contact: "email", email: "max@example.de" }), {});
  assert.deepEqual(errorsOf({ email: "not-an-address" }), { email: "invalid_email" });
  assert.deepEqual(errorsOf({ preferred_contact: "fax" }), { preferred_contact: "invalid_choice" });
  assert.deepEqual(errorsOf({ preferred_city: "ankara" }), { preferred_city: "invalid_choice" });
  assert.deepEqual(errorsOf({ preferred_language: "fr" }), { preferred_language: "invalid_choice" });
});

// --- toInternational: national input + calling-code region → +E.164 candidate for Django's phonenumbers.
test("toInternational drops the trunk 0, keeps Italian leading zeros, accepts typed international numbers", () => {
  assert.equal(toInternational("TR", "0542 713 01 32"), "+905427130132");
  assert.equal(toInternational("DE", "0151 1234-5678"), "+4915112345678");
  assert.equal(toInternational("IT", "06 1234 5678"), "+390612345678");
  assert.equal(toInternational("GB", "+44 7911 123456"), "+447911123456");
  assert.equal(toInternational("GB", "0044 7911 123456"), "+447911123456");
  assert.equal(toInternational("ZZ", "123456"), "");
});

// --- toFormState: Django's response → what the form shows (API_SPEC §2–3).
test("toFormState maps every API outcome", () => {
  assert.deepEqual(toFormState(201, { reference: "JD-7K3Q9P", created: true }), { status: "success", reference: "JD-7K3Q9P" });
  assert.deepEqual(toFormState(200, { reference: "JD-7K3Q9P", created: false }), { status: "success", reference: "JD-7K3Q9P" });
  assert.deepEqual(toFormState(400, { errors: { phone: ["invalid_phone"], consent: ["consent_required"] } }), {
    status: "error",
    fieldErrors: { phone: "invalid_phone", consent: "consent_required" },
  });
  assert.deepEqual(toFormState(400, { errors: { submission_id: ["invalid"] } }), { status: "error", formError: "server_error" });
  assert.deepEqual(toFormState(429, { error: "rate_limited", retry_after: 1800 }), { status: "error", formError: "rate_limited" });
  assert.deepEqual(toFormState(401, { error: "unauthorized" }), { status: "error", formError: "server_error" });
  assert.deepEqual(toFormState(500, null), { status: "error", formError: "server_error" });
  assert.deepEqual(toFormState(201, { nope: 1 }), { status: "error", formError: "server_error" });
});

test("readLead: without a chosen phone code the country of residence supplies it", () => {
  const form = new FormData();
  form.set("country", "TR");
  form.set("phone", "0542 713 01 32");
  assert.equal(readLead(form).phone_code, "TR");
  form.set("phone_code", "DE");
  assert.equal(readLead(form).phone_code, "DE");
});
