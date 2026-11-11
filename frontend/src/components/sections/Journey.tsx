import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";

// HOMEPAGE_UX_SPEC S05 — only confirmed services. Motion (D-063, CSS view timelines, globals.css "Journey"):
// the navy panel opens to full bleed, a glowing head runs along the line and each step lights up as it passes.
// Without scroll-driven animations, with reduced motion or without JS: the finished journey.
const HEAD = "journey-head absolute size-2.5 rounded-full bg-white shadow-[0_0_0_3px_rgb(127_211_244/0.45),0_0_18px_5px_rgb(127_211_244/0.75)]";

export async function Journey() {
  const t = await getTranslations("home.journey");
  const nav = await getTranslations("nav");
  const steps = t.raw("steps") as { title: string; text: string }[];
  const whatsapp = waLink((await getTranslations("whatsapp"))("international"));

  return (
    <Section tone="navy" labelledBy="journey-title" className="panel-open overflow-clip">
      <div aria-hidden="true" className="absolute -top-40 end-0 size-[36rem] rounded-full bg-blue-700/40 blur-3xl" />
      <div className="relative">
        <SectionHeader id="journey-title" dark eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <div className="relative mt-14 [view-timeline-name:--journey] lg:mt-20">
          {/* Track (clips) → runner (the line; slides in) → head (glows at the runner's leading end). */}
          <div aria-hidden="true" className="absolute start-[11.5px] top-3 bottom-10 w-px overflow-y-clip lg:hidden">
            <div data-journey-line="y" className="journey-run-y relative size-full bg-sky-400/70">
              <span className={`${HEAD} start-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rtl:translate-x-1/2`} />
            </div>
          </div>
          <div aria-hidden="true" className="absolute start-3 end-[calc((100%-6rem)/5-0.75rem)] top-[11.5px] hidden h-px overflow-x-clip lg:block">
            <div data-journey-line="x" className="journey-run-x relative size-full bg-sky-400/70">
              <span className={`${HEAD} end-0 top-1/2 translate-x-1/2 -translate-y-1/2 rtl:-translate-x-1/2`} />
            </div>
          </div>
          <ol className="grid gap-10 lg:grid-cols-5 lg:gap-6">
            {steps.map((step, i) => (
              <li key={step.title} data-journey-step="" style={{ "--i": i } as CSSProperties} className="journey-step relative ps-12 lg:ps-0 lg:pt-14">
                <span aria-hidden="true" className="journey-marker absolute start-0 top-0 size-6 rounded-full border border-sky-400 bg-sky-400 shadow-[0_0_0_6px_rgb(127_211_244/0.15)]" />
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
    </Section>
  );
}
