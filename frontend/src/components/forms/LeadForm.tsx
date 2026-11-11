import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { COUNTRIES } from "@/lib/countries";
import { ConsultationForm, type CountryOption } from "./ConsultationForm";

const TOP = ["TR", "GB", "DE"]; // most visitors first (spec §3), then every country alphabetically

// Server half of the form: localized country names (Intl, computed once here so server and browser render the
// same text) and only the message namespaces the client form needs.
export async function LeadForm({ treatment }: { treatment?: string }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const collator = new Intl.Collator(locale);
  const countries: CountryOption[] = COUNTRIES.map(([code, dial]) => ({ code, dial, name: names.of(code) ?? code })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
  const top = TOP.map((code) => countries.find((country) => country.code === code)!);
  return (
    <NextIntlClientProvider messages={{ form: messages.form, whatsapp: messages.whatsapp }}>
      <ConsultationForm countries={countries} top={top} defaultTreatment={treatment} />
    </NextIntlClientProvider>
  );
}
