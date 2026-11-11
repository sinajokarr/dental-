import { getTranslations } from "next-intl/server";
import { Section, SectionHeader } from "@/components/ui/Section";
import { waLink } from "@/lib/whatsapp";

// Only questions with confirmed answers; stay length, cost and guarantees wait for clinic data (Q11).
export async function Faq() {
  const t = await getTranslations("home.faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const whatsapp = waLink((await getTranslations("whatsapp"))("general"));

  return (
    <Section tone="ice" labelledBy="faq-title">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <SectionHeader id="faq-title" eyebrow={t("eyebrow")} title={t("title")} />
          <p className="mt-6 text-slate-600">{t("more")}</p>
          <a href={whatsapp} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-11 items-center font-semibold text-blue-700 underline-offset-4 hover:underline">
            {t("whatsapp")}
          </a>
        </div>
        <div className="divide-y divide-sky-200 border-y border-sky-200">
          {items.map((item) => (
            <details key={item.q} name="faq" className="faq group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-6 text-h3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 text-blue-700 transition-transform duration-300 group-open:rotate-45">
                  <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="max-w-2xl pb-6 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
