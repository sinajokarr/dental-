// Light validation shared by the form (browser) and the Server Action (LEAD_MANAGEMENT_AND_FORM_SPEC §4).
// Django is the reference: it re-validates everything, including the phone number with phonenumbers.
import { COUNTRIES } from "./countries.ts";

export const TREATMENTS = ["implants", "veneers", "smile_design", "not_sure"] as const;
export const CONTACTS = ["whatsapp", "phone", "email"] as const;
export const CITIES = ["no_preference", "antalya", "istanbul"] as const;
export const LANGUAGES = ["fa", "en", "de", "tr"] as const;

export type ErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_choice"
  | "invalid_phone"
  | "invalid_email"
  | "email_required"
  | "consent_required";

export type LeadInput = {
  full_name: string;
  country: string;
  phone_code: string; // region whose calling code prefixes the number (may differ from the country of residence)
  phone: string; // as typed
  treatment: string;
  consent: boolean;
  preferred_contact: string;
  email: string;
  preferred_city: string;
  preferred_language: string;
  message: string;
};

export type LeadField = Exclude<keyof LeadInput, "phone_code">;
export type FieldErrors = Partial<Record<LeadField, ErrorCode>>;

const CALLING_CODES = new Map(COUNTRIES);
const KEEPS_LEADING_ZERO = new Set(["IT", "SM", "VA"]); // the 0 belongs to the national number there

/** "+<code><national>" for Django's phonenumbers: drops the trunk 0, accepts numbers typed as +… or 00…. */
export function toInternational(region: string, typed: string): string {
  const compact = typed.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return `+${compact.slice(1).replace(/\D/g, "")}`;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  const code = CALLING_CODES.get(region);
  if (!code) return "";
  return `+${code}${KEEPS_LEADING_ZERO.has(region) ? compact : compact.replace(/^0/, "")}`;
}

const oneOf = (value: string, options: readonly string[]): ErrorCode | undefined =>
  options.includes(value) ? undefined : "invalid_choice";

export function validateLead(input: LeadInput): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.full_name.trim();
  if (!name) errors.full_name = "required";
  else if (name.length < 2) errors.full_name = "too_short";
  else if (name.length > 120) errors.full_name = "too_long";

  if (!input.country) errors.country = "required";
  else if (!CALLING_CODES.has(input.country)) errors.country = "invalid_choice";

  const digits = toInternational(input.phone_code, input.phone).length - 1; // E.164: at most 15 digits
  if (!input.phone.trim()) errors.phone = "required";
  else if (digits < 7 || digits > 15) errors.phone = "invalid_phone";

  if (!input.treatment) errors.treatment = "required";
  else if (oneOf(input.treatment, TREATMENTS)) errors.treatment = "invalid_choice";

  if (!input.consent) errors.consent = "consent_required";

  if (oneOf(input.preferred_contact, CONTACTS)) errors.preferred_contact = "invalid_choice";
  const email = input.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "invalid_email";
  else if (!email && input.preferred_contact === "email") errors.email = "email_required";

  if (oneOf(input.preferred_city, CITIES)) errors.preferred_city = "invalid_choice";
  if (oneOf(input.preferred_language, LANGUAGES)) errors.preferred_language = "invalid_choice";
  if (input.message.length > 1000) errors.message = "too_long";
  return errors;
}

/** FormData → LeadInput (missing fields become empty; the checkbox is "on" when ticked). */
export function readLead(form: FormData): LeadInput {
  const text = (name: string) => String(form.get(name) ?? "");
  return {
    full_name: text("full_name"),
    country: text("country"),
    phone_code: text("phone_code") || text("country"), // no code chosen (e.g. no JS yet): the country's code
    phone: text("phone"),
    treatment: text("treatment"),
    consent: form.get("consent") === "on",
    preferred_contact: text("preferred_contact") || "whatsapp",
    email: text("email"),
    preferred_city: text("preferred_city") || "no_preference",
    preferred_language: text("preferred_language"),
    message: text("message"),
  };
}
