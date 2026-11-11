import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";

// Advantages, each traceable to a confirmed fact in PROJECT_BRIEF (AN-15). Not a sequence, so no numbers;
// on desktop the heading stays in view while the list scrolls past it.
export async function WhyJokar() {
  const t = await getTranslations("home.why");
  const items = t.raw("items") as { title: string; text: string }[];

  return (
    <Section labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader id="why-title" eyebrow={t("eyebrow")} title={t("title")} />
        </div>
        <div>
          <ul className="divide-y divide-sky-200 border-y border-sky-200">
            {items.map((item, i) => (
              <li key={item.title} data-reveal="" style={{ "--i": i } as CSSProperties} className="grid gap-2 py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
                <h3 className="text-h3 font-semibold">{item.title}</h3>
                <p className="text-slate-600">{item.text}</p>
              </li>
            ))}
          </ul>
          <Link href="/international-patients" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 underline-offset-4 hover:underline">
            {t("link")}
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
              <path d="M3 8h10m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </Section>
  );
}
