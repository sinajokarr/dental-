import { ViewTransition } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { LeadForm } from "@/components/forms/LeadForm";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { Consultation } from "./Consultation";
import { Faq } from "./Faq";
import { ImplantAnatomy, PorcelainLayers, SmileAnalysis } from "./explorers/Explorers";
import { ImplantRender } from "./service-art/ImplantRender";
import { ServiceArt } from "./service-art/ServiceArt";
import { SmileRender } from "./service-art/SmileRender";
import { VeneersRender } from "./service-art/VeneersRender";

// The three treatment pages (D-082): hero with the treatment's studio render, what it is, the treatment's own explorer
// (implant anatomy · porcelain layers · smile analysis), who it is for, how it works, the treatment's own notes
// (materials, aesthetics, aftercare, risks — a different set per treatment), international patients, its FAQ and the
// consultation form with the treatment preselected. General educational wording, no durations, prices or results
// beyond the confirmed facts (Claims Policy); it awaits a medical reviewer (Q7).
type Treatment = "implants" | "veneers" | "smileDesign";
const CONTEXT = { implants: "implants", veneers: "veneers", smileDesign: "smile_design" } as const;
const HREF = { implants: "/dental-implants", veneers: "/dental-veneers", smileDesign: "/smile-design" } as const;

export async function treatmentMetadata(treatment: Treatment): Promise<Metadata> {
  const t = await getTranslations("treatments");
  return pageMetadata(await getLocale(), HREF[treatment], t(`${treatment}.title`), t(`${treatment}.lead`));
}

export async function TreatmentPage({ treatment }: { treatment: Treatment }) {
  const t = await getTranslations("treatments");
  const page = await getTranslations("treatmentPage");
  const home = await getTranslations("home");
  const nav = await getTranslations("nav");
  const chat = await getTranslations("whatsapp");
  const context = CONTEXT[treatment];
  const title = t(`${treatment}.title`);
  const what = t.raw(`${treatment}.what`) as string[];
  const who = t.raw(`${treatment}.who`) as string[];
  const how = t.raw(`${treatment}.how`) as { title: string; text: string }[];
  const faq = t.raw(`${treatment}.faq`) as { q: string; a: string }[];
  const notes = t.raw(`${treatment}.notes`) as { id: string; title: string; text: string[] }[];
  const explorer = t.raw(`${treatment}.explorer`) as { title: string; lead: string; hint: string; note: string; apart?: string; seated?: string; items: { key: string; title: string; text: string }[] };

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
                  {title}
                </li>
              </ol>
            </nav>
            <p className="eyebrow hero-rise mt-6 text-blue-700 [--d:100ms]">{page("eyebrow")}</p>
            <h1 id="page-title" className="hero-rise mt-4 font-display text-display font-light text-balance [--d:150ms]">
              {title}
            </h1>
            <p className="hero-rise mt-6 max-w-xl text-lead text-slate-600 [--d:300ms]">{t(`${treatment}.lead`)}</p>
            <div className="hero-rise mt-8 flex flex-col gap-3 [--d:450ms] sm:flex-row">
              <a href="#consultation" className={`w-full sm:w-auto ${buttonClass("primary", "lg")}`}>
                {home("hero.cta")}
              </a>
              <a href={waLink(chat(context))} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
                <WhatsAppIcon className="size-5 text-[#128C4A]" />
                {nav("whatsapp")}
              </a>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-white/70 shadow-e2" />
            <ViewTransition name={`treatment-${treatment}`}>
              <div aria-hidden="true" className="relative size-full">
                <ServiceArt name={treatment} />
              </div>
            </ViewTransition>
          </div>
        </div>
      </section>

      <Section labelledBy="what-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <SectionHeader id="what-title" title={page("what")} />
          <div className="grid gap-5">
            {what.map((paragraph, i) => (
              <p key={paragraph} data-reveal="" style={{ "--i": i } as CSSProperties} className="text-lead text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="ice" labelledBy="explorer-title">
        <SectionHeader id="explorer-title" title={explorer.title} lead={explorer.lead} />
        <div className="mt-10 lg:mt-14">
          {treatment === "implants" && (
            <ImplantAnatomy items={explorer.items} hint={explorer.hint}>
              <ImplantRender />
            </ImplantAnatomy>
          )}
          {treatment === "veneers" && (
            <PorcelainLayers items={explorer.items} label={explorer.hint} apart={explorer.apart!} seated={explorer.seated!}>
              <VeneersRender />
            </PorcelainLayers>
          )}
          {treatment === "smileDesign" && (
            <SmileAnalysis items={explorer.items} hint={explorer.hint}>
              <SmileRender />
            </SmileAnalysis>
          )}
        </div>
        <p className="mt-8 text-small text-slate-600">{explorer.note}</p>
      </Section>

      <Section labelledBy="who-title">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <SectionHeader id="who-title" title={page("who")} />
          <ul className="divide-y divide-sky-200 border-y border-sky-200">
            {who.map((item, i) => (
              <li key={item} data-reveal="" style={{ "--i": i } as CSSProperties} className="flex gap-4 py-5">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-6 shrink-0 fill-none stroke-blue-700 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span className="text-navy-900">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="ice" labelledBy="how-title">
        <SectionHeader id="how-title" title={page("how")} />
        <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {how.map((step, i) => (
            <li key={step.title} data-reveal="" style={{ "--i": i } as CSSProperties} className="border-t border-sky-200 pt-6">
              <p className="eyebrow text-blue-700">0{i + 1}</p>
              <h3 className="mt-3 text-h3 font-semibold">{step.title}</h3>
              <p className="mt-2 text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="notes-title-0">
        <div className={`grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 ${notes.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {notes.map((note, i) => (
            <article key={note.id} data-note={note.id} className="border-t border-sky-200 pt-6">
              <h2 id={`notes-title-${i}`} className="font-display text-h3 font-light">
                {note.title}
              </h2>
              {note.text.map((paragraph) => (
                <p key={paragraph} data-reveal="" className="mt-4 text-slate-600">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
        <p className="mt-12 text-small text-slate-600">{page("medicalNote")}</p>
      </Section>

      <Section tone="navy" labelledBy="intl-title" className="panel-open overflow-clip">
        <div aria-hidden="true" className="absolute -top-40 end-0 size-[30rem] rounded-full bg-blue-700/40 blur-3xl" />
        <div className="relative grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <SectionHeader id="intl-title" dark eyebrow={page("intlEyebrow")} title={page("intlTitle")} lead={page("intlText")} />
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
            <Link href="/international-patients" className={buttonClass("inverted", "lg")}>
              {home("why.link")}
            </Link>
            <a href={waLink(chat("international"))} target="_blank" rel="noopener" className={buttonClass("whatsapp-dark", "lg")}>
              <WhatsAppIcon className="size-5 text-[#25D366]" />
              {nav("whatsapp")}
            </a>
          </div>
        </div>
      </Section>

      <Faq items={faq} whatsappContext={context} />
      <Consultation form={<LeadForm treatment={context} />} whatsappContext={context} />
    </>
  );
}
