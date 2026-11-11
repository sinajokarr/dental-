import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { COUNTRIES } from "@/lib/countries";
import { CITIES, CONTACTS, TREATMENTS } from "@/lib/validate-lead";
import { ConsultationForm, type CountryOption, type FormCopy } from "./ConsultationForm";

const TOP = ["TR", "GB", "DE"]; // most visitors first (spec §3), then every country alphabetically
const ERRORS = ["required", "too_short", "too_long", "invalid_choice", "invalid_phone", "invalid_email", "email_required", "consent_required", "rate_limited", "server_error", "network_error"] as const;

// Server half of the form: localized country names (Intl, computed here so server and browser render the same
// text) and every word, already translated — the browser bundle carries no message formatter (H03 budget).
export async function LeadForm({ treatment }: { treatment?: string }) {
  const locale = await getLocale();
  const t = await getTranslations("form");
  const chat = await getTranslations("whatsapp");
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const collator = new Intl.Collator(locale);
  const countries: CountryOption[] = COUNTRIES.map(([code, dial]) => ({ code, dial, name: names.of(code) ?? code })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
  const top = TOP.map((code) => countries.find((country) => country.code === code)!);
  const pick = <K extends string>(keys: readonly K[], label: (key: K) => string) => Object.fromEntries(keys.map((k) => [k, label(k)])) as Record<K, string>;
  const copy: FormCopy = {
    title: t("title"), fullName: t("fullName"), country: t("country"), choose: t("choose"), phone: t("phone"), phoneCode: t("phoneCode"),
    treatment: t("treatment"), treatments: pick(TREATMENTS, (k) => t(`treatments.${k}`)), consentShort: t("consentShort"),
    consent: t.rich("consent", {
      privacy: (chunks) => (
        <Link href="/privacy" className="font-semibold text-blue-700 underline underline-offset-4">
          {chunks}
        </Link>
      ),
    }),
    optional: t("optional"), contact: t("contact"), contacts: pick(CONTACTS, (k) => t(`contacts.${k}`)), email: t("email"),
    city: t("city"), cities: pick(CITIES, (k) => t(`cities.${k}`)), language: t("language"), message: t("message"),
    messageHint: t("messageHint"), submit: t("submit"), sending: t("sending"), replyNote: t("replyNote"),
    summaries: Array.from({ length: 11 }, (_, count) => t("summary", { count })), // up to the ten fields
    retry: t("retry"), orWhatsapp: t("orWhatsapp"), errors: pick(ERRORS, (k) => t(`errors.${k}`)),
    success: { title: t("success.title"), reference: t("success.reference"), next: t("success.next"), whatsapp: t("success.whatsapp") },
    whatsappGeneral: chat("general"), whatsappAfterForm: chat.raw("after_form") as string,
  };
  return <ConsultationForm copy={copy} countries={countries} top={top} defaultTreatment={treatment} />;
}
