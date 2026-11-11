import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { TiltCard } from "@/components/ui/TiltCard";
import { Link } from "@/i18n/navigation";
import { TreatmentIcon } from "./TreatmentIcon";

export async function Treatments() {
  const t = await getTranslations("home.treatments");
  const nav = await getTranslations("nav");
  const cards = [
    { key: "implants", href: "/dental-implants", title: nav("implants") },
    { key: "veneers", href: "/dental-veneers", title: nav("veneers") },
    { key: "smileDesign", href: "/smile-design", title: nav("smileDesign") },
  ] as const;

  return (
    <Section tone="ice" labelledBy="treatments-title" className="overflow-hidden">
      <div aria-hidden="true" className="absolute inset-x-0 top-1/3 -z-0 mx-auto h-96 max-w-4xl rounded-full bg-sky-100 opacity-70 blur-3xl" />
      <div className="relative">
        <SectionHeader id="treatments-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16">
          {cards.map((card, i) => (
            <li key={card.key}>
              <TiltCard
                data-treatment-card=""
                data-reveal=""
                style={{ "--i": i } as CSSProperties}
                className="glass-card h-full rounded-md p-7 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-blue-700 lg:p-8"
              >
                <div data-reveal="clip" className="mb-8 flex h-24 items-center">
                  <TreatmentIcon name={card.key} />
                </div>
                <p className="eyebrow text-blue-700">0{i + 1}</p>
                <h3 className="mt-3 text-h3 font-semibold">
                  {/* Stretched link: the whole card is one link and one tab stop. */}
                  <Link href={card.href} className="outline-none after:absolute after:inset-0 after:rounded-[inherit]">
                    {card.title}
                  </Link>
                </h3>
                <p className="mt-3 text-slate-600">{t(card.key)}</p>
                <span aria-hidden="true" className="mt-6 inline-flex items-center gap-2 text-small font-semibold text-blue-700">
                  {t("more")}
                  <svg viewBox="0 0 16 16" className="size-4 transition-transform group-hover/card:translate-x-1 rtl:-scale-x-100 rtl:group-hover/card:-translate-x-1">
                    <path d="M3 8h10m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </TiltCard>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
