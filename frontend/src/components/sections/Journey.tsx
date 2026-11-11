import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";
import { JourneyMotion } from "./JourneyMotion";

// HOMEPAGE_UX_SPEC S05 — only confirmed services; no prices, durations or aftercare claims (Q11).
export async function Journey() {
  const t = await getTranslations("home.journey");
  const nav = await getTranslations("nav");
  const steps = t.raw("steps") as { title: string; text: string }[];
  const whatsapp = waLink((await getTranslations("whatsapp"))("international"));

  return (
    <Section tone="navy" labelledBy="journey-title" className="overflow-hidden">
      <div data-journey-panel className="relative">
        <div aria-hidden="true" className="absolute -top-40 end-0 size-[36rem] rounded-full bg-blue-700/40 blur-3xl" />
        <div className="relative">
          <SectionHeader id="journey-title" dark eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
          <div className="relative mt-14 lg:mt-20">
            <span data-journey-line="y" aria-hidden="true" className="absolute start-[11.5px] top-3 bottom-10 w-px origin-top bg-sky-400/70 lg:hidden" />
            <span data-journey-line="x" aria-hidden="true" className="absolute start-3 end-[calc((100%-6rem)/5-0.75rem)] top-[11.5px] hidden h-px origin-left bg-sky-400/70 lg:block rtl:origin-right" />
            <ol className="grid gap-10 lg:grid-cols-5 lg:gap-6">
              {steps.map((step, i) => (
                <li key={step.title} data-journey-step="" className="group relative ps-12 transition-opacity duration-500 data-pending:opacity-45 lg:ps-0 lg:pt-14">
                  <span
                    aria-hidden="true"
                    className="absolute start-0 top-0 size-6 rounded-full border border-sky-400 bg-sky-400 shadow-[0_0_0_6px_rgb(127_211_244/0.15)] transition-colors duration-500 group-data-pending:bg-navy-900 group-data-pending:shadow-none"
                  />
                  <p className="eyebrow text-sky-400">0{i + 1}</p>
                  <h3 className="mt-2 text-h3 font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-dark-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14 flex flex-col gap-3 sm:flex-row lg:mt-20">
            <a href="#consultation" className={buttonClass("inverted", "lg")}>
              {t("cta")}
            </a>
            <a href={whatsapp} target="_blank" rel="noopener" className={buttonClass("whatsapp-dark", "lg")}>
              <WhatsAppIcon className="size-5 text-[#25D366]" />
              {nav("whatsapp")}
            </a>
          </div>
        </div>
      </div>
      <JourneyMotion />
    </Section>
  );
}
