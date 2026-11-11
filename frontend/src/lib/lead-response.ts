// Django lead API response → the form's state (API_SPEC §2–3). Pure, so it is unit-tested.
import type { ErrorCode, FieldErrors, LeadField } from "./validate-lead.ts";

export type FormError = "rate_limited" | "server_error" | "network_error";

/** What the visitor typed, sent back with an error so nothing is lost when React resets the form. */
export type SubmittedValues = Partial<Record<"full_name" | "country" | "phone_code" | "phone" | "treatment" | "consent" | "preferred_contact" | "email" | "preferred_city" | "preferred_language" | "message", string>>;

export type ConsultationState =
  | { status: "idle" }
  | { status: "success"; reference: string }
  | { status: "error"; fieldErrors?: FieldErrors; formError?: FormError; values?: SubmittedValues };

const FORM_FIELDS = new Set<string>([
  "full_name", "country", "phone", "treatment", "consent", "preferred_contact", "email", "preferred_city", "preferred_language", "message",
]);
const CODES = new Set<string>([
  "required", "too_short", "too_long", "invalid_choice", "invalid_phone", "invalid_email", "email_required", "consent_required",
]);

export function toFormState(status: number, body: unknown): ConsultationState {
  const data = (body ?? {}) as { reference?: unknown; errors?: Record<string, unknown> };
  if ((status === 200 || status === 201) && typeof data.reference === "string") return { status: "success", reference: data.reference };
  if (status === 429) return { status: "error", formError: "rate_limited" };
  if (status === 400 && data.errors && typeof data.errors === "object") {
    const fieldErrors: FieldErrors = {};
    for (const [field, codes] of Object.entries(data.errors)) {
      const code = Array.isArray(codes) ? codes[0] : undefined;
      // An error the visitor cannot fix in the form (e.g. a bad submission_id) is our fault, not theirs.
      if (!FORM_FIELDS.has(field) || typeof code !== "string" || !CODES.has(code)) return { status: "error", formError: "server_error" };
      fieldErrors[field as LeadField] = code as ErrorCode;
    }
    return { status: "error", fieldErrors };
  }
  return { status: "error", formError: "server_error" };
}
