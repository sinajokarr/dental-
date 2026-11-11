"use server";

// Consultation form → internal Django lead API (API_SPEC §3, D-033). Works with and without JavaScript.
// The locale arrives as a form field: Server Actions cannot read root params (D-054), and binding the action
// during render (action.bind) sends the no-JS render of Next 16 into an endless loop (found by the e2e test).
import "server-only";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { toFormState, type ConsultationState, type SubmittedValues } from "@/lib/lead-response";
import { LANGUAGES, readLead, toInternational, validateLead } from "@/lib/validate-lead";

const CONSENT_VERSION = "draft-1"; // the privacy text awaits legal review (D-062) — must change before launch
const TIMEOUT_MS = 8000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

/** Source page and UTM come only from the page URL (the Referer of this same-origin POST) — no cookies or storage. */
function source(referer: string | null): { source_page: string; utm: Partial<Record<(typeof UTM_KEYS)[number], string>> } {
  try {
    const url = new URL(referer ?? "");
    const utm = Object.fromEntries(UTM_KEYS.flatMap((key) => (url.searchParams.get(`utm_${key}`) ? [[key, url.searchParams.get(`utm_${key}`)!.slice(0, 100)]] : [])));
    return { source_page: url.pathname.slice(0, 200), utm };
  } catch {
    return { source_page: "", utm: {} };
  }
}

const KEPT = ["full_name", "country", "phone_code", "phone", "treatment", "consent", "preferred_contact", "email", "preferred_city", "preferred_language", "message"] as const;

export async function submitConsultation(previous: ConsultationState, form: FormData): Promise<ConsultationState> {
  const sent = String(form.get("locale") ?? "");
  const state = await send((LANGUAGES as readonly string[]).includes(sent) ? sent : "en", form);
  if (state.status !== "error") return state;
  const values: SubmittedValues = Object.fromEntries(KEPT.map((key) => [key, String(form.get(key) ?? "")]));
  return { ...state, values };
}

async function send(locale: string, form: FormData): Promise<ConsultationState> {
  // Honeypot (spec §6): a bot that fills the hidden field is told "success" and nothing is stored.
  if (String(form.get("website") ?? "")) return { status: "success", reference: `JD-${randomUUID().slice(0, 6).toUpperCase()}` };

  const lead = readLead(form);
  const fieldErrors = validateLead(lead);
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const url = process.env.LEAD_API_URL, token = process.env.INTERNAL_API_TOKEN;
  if (!url || !token) {
    console.error("Lead API is not configured (LEAD_API_URL, INTERNAL_API_TOKEN)");
    return { status: "error", formError: "server_error" };
  }
  const request = await headers();
  // Behind Caddy the visitor's address is the last X-Forwarded-For entry (added by the proxy itself).
  const clientIp = request.get("x-forwarded-for")?.split(",").at(-1)?.trim() || request.get("x-real-ip") || "";
  const submitted = String(form.get("submission_id") ?? "");
  const body = JSON.stringify({
    submission_id: UUID.test(submitted) ? submitted : randomUUID(), // without JS the browser cannot make one
    full_name: lead.full_name.trim(),
    country: lead.country,
    phone: toInternational(lead.phone_code, lead.phone),
    email: lead.email.trim(),
    treatment: lead.treatment,
    preferred_contact: lead.preferred_contact,
    preferred_city: lead.preferred_city,
    preferred_language: lead.preferred_language || locale,
    site_locale: locale,
    message: lead.message.trim(),
    consent: true,
    consent_version: CONSENT_VERSION,
    ...source(request.get("referer")),
  });

  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(clientIp && { "X-Client-IP": clientIp }) },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
      const state = toFormState(response.status, await response.json().catch(() => null));
      if (state.status === "error" && state.formError === "server_error") console.error(`Lead API answered ${response.status}`);
      return state;
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      // A refused connection fails fast: one retry with the same submission_id is safe (idempotent).
      if (attempt === 1 && !timedOut) continue;
      console.error(`Lead API unreachable (${timedOut ? "timeout" : error instanceof Error ? error.name : "error"})`);
      return { status: "error", formError: "network_error" };
    }
  }
}
