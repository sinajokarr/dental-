import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";
import { PageIntro } from "@/components/sections/PageIntro";
import { buttonClass } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/whatsapp";

// G07 — About, written from confirmed facts only (D-062): no doctors, years, patient numbers or awards.
export default async function AboutPage() {
  const t = await getTranslations("about");
  const nav = await getTranslations("nav");
  const chat = await getTranslations("whatsapp");
  const sections = t.raw("sections") as { title: string; text: string }[];
  return (
    <>
      <PageIntro title={t("title")} lead={t("lead")} current={nav("about")} />
      <Section>
        <ul className="divide-y divide-sky-200 border-y border-sky-200">
          {sections.map((section, i) => (
            <li key={section.title} data-about-section="" data-reveal="" style={{ "--i": i } as CSSProperties} className="grid grid-cols-1 gap-3 py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
              <h2 className="font-display text-h2 font-light text-balance">{section.title}</h2>
              <p className="text-lead text-slate-600">{section.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <Link href="/free-consultation" className={buttonClass("primary", "lg")}>
            {t("cta")}
          </Link>
          <a href={waLink(chat("general"))} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
            <WhatsAppIcon className="size-5 text-[#128C4A]" />
            {nav("whatsapp")}
          </a>
        </div>
      </Section>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata(await getLocale(), "/about", t("about.title"), t("about.lead"));
}
