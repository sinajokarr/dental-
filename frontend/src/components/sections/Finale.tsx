import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";

// HOMEPAGE_UX_SPEC S11 — the last call to action, a quiet Soft Blue band before the footer (D-083: fewer dark
// bands). The panel opens as it enters and a band of light crosses it with the scroll (D-063).
export async function Finale() {
  const t = await getTranslations("home.finale");
  const nav = await getTranslations("nav");
  const whatsapp = waLink((await getTranslations("whatsapp"))("general"));

  return (
    <Section tone="mist" labelledBy="finale-title" className="panel-open overflow-clip text-center [view-timeline-name:--finale]">
      <div aria-hidden="true" className="absolute inset-x-0 -top-24 mx-auto h-80 max-w-3xl rounded-full bg-white/70 blur-3xl" />
      <div aria-hidden="true" className="finale-sweep pointer-events-none absolute inset-y-0 -inset-x-1/2 bg-[linear-gradient(105deg,transparent_42%,color-mix(in_srgb,var(--color-white)_55%,transparent)_50%,transparent_58%)] opacity-0" />
      <div className="relative">
        <SectionHeader id="finale-title" center title={t("title")} lead={t("lead")} />
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="#consultation" className={buttonClass("primary", "lg")}>
            {nav("cta")}
          </a>
          <a href={whatsapp} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
            <WhatsAppIcon className="size-5 text-[#128C4A]" />
            {nav("whatsapp")}
          </a>
        </div>
      </div>
    </Section>
  );
}
