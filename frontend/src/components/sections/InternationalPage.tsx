import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { LeadForm } from "@/components/forms/LeadForm";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/whatsapp";
import { Cities } from "./Cities";
import { Consultation } from "./Consultation";
import { Faq } from "./Faq";
import { Journey } from "./Journey";
import travel from "../../assets/photos/travel.jpg";

// G05 — International Patients (SITEMAP_AND_USER_FLOWS §1, INTERNATIONAL_PATIENT_FUNNEL). Only confirmed
// services (D-062); travel questions are the confirmed homepage answers.
const ICONS = [
  "M4 8h3l2-3h6l2 3h3v11H4zm8 8.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", // online assessment (photos)
  "M3 18V7m0 7h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", // hotel
  "m3 14 18-8-5 14-3.5-5.5L3 14Zm9.5.5L16 20", // airport transfer
  "M4 6h9M8.5 4v2m2.5 0c-.6 3.6-3 6.8-6.5 8.5M7 9.5c1.2 1.8 3 3.2 5 4M13 20l4-9 4 9m-6.8-2.5h5.6", // interpreter
  "M4 8l8-4 8 4v8l-8 4-8-4zm0 0 8 4 8-4m-8 4v8", // packages
  "M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4", // follow-up
];
const TRAVEL_FAQ = [2, 3, 4, 5, 6, 7]; // languages, assessment, stay, hotel & transfer, interpreter, follow-up

export async function InternationalPage() {
  const t = await getTranslations("international");
  const page = await getTranslations("treatmentPage");
  const home = await getTranslations("home");
  const nav = await getTranslations("nav");
  const chat = await getTranslations("whatsapp");
  const services = t.raw("services") as { title: string; text: string }[];
  const faq = (home.raw("faq.items") as { q: string; a: string }[]).filter((_, i) => TRAVEL_FAQ.includes(i));

  return (
    <>
      <section aria-labelledby="page-title" className="relative isolate overflow-clip bg-ice-50 pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-12">
          <div>
            <nav aria-label={page("breadcrumb")} className="text-small text-slate-600">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-blue-700 hover:underline">
                    {page("home")}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-semibold text-navy-900">
                  {nav("international")}
                </li>
              </ol>
            </nav>
            <p className="eyebrow hero-rise mt-6 text-blue-700 [--d:100ms]">{t("eyebrow")}</p>
            <h1 id="page-title" className="hero-rise mt-4 font-display text-display font-light text-balance [--d:150ms]">
              {t("title")}
            </h1>
            <p className="hero-rise mt-6 max-w-xl text-lead text-slate-600 [--d:300ms]">{t("lead")}</p>
            <div className="hero-rise mt-8 flex flex-col gap-3 [--d:450ms] sm:flex-row">
              <a href="#consultation" className={`w-full sm:w-auto ${buttonClass("primary", "lg")}`}>
                {home("hero.cta")}
              </a>
              <a href={waLink(chat("international"))} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
                <WhatsAppIcon className="size-5 text-[#128C4A]" />
                {nav("whatsapp")}
              </a>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md">
            <Image src={travel} alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 64rem) 448px, 384px" quality={75} placeholder="blur" className="rounded-t-[999px] rounded-b-[28px] object-cover shadow-e3" />
          </div>
        </div>
      </section>

      <Section labelledBy="services-title">
        <SectionHeader id="services-title" eyebrow={t("servicesEyebrow")} title={t("servicesTitle")} />
        <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {services.map((service, i) => (
            <li key={service.title} data-reveal="" style={{ "--i": i } as CSSProperties} className="border-t border-sky-200 pt-6">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-blue-700 stroke-[1.4] [stroke-linecap:round] [stroke-linejoin:round]">
                <path d={ICONS[i]} />
              </svg>
              <h3 className="mt-4 text-h3 font-semibold">{service.title}</h3>
              <p className="mt-2 text-slate-600">{service.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Journey />

      <Section labelledBy="stay-title">
        <div data-reveal="" className="max-w-3xl">
          <h2 id="stay-title" className="font-display text-h2 font-light text-balance">
            {t("stayTitle")}
          </h2>
          <p className="mt-5 text-lead text-slate-600">{t("stayText")}</p>
        </div>
      </Section>

      <Cities />

      <Faq items={faq} whatsappContext="international" />
      <Consultation form={<LeadForm />} whatsappContext="international" />
    </>
  );
}
