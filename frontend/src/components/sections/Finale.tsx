import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";

// HOMEPAGE_UX_SPEC S11 — the last call to action; flows into the navy footer. The panel opens as it enters and
// a band of ice light crosses it with the scroll (D-063).
export async function Finale() {
  const t = await getTranslations("home.finale");
  const nav = await getTranslations("nav");
  const whatsapp = waLink((await getTranslations("whatsapp"))("general"));

  return (
    <Section tone="navy" labelledBy="finale-title" className="panel-open overflow-clip text-center [view-timeline-name:--finale]">
      <div aria-hidden="true" className="absolute inset-x-0 -top-24 mx-auto h-80 max-w-3xl rounded-full bg-blue-700/50 blur-3xl" />
      <div aria-hidden="true" className="finale-sweep pointer-events-none absolute inset-y-0 -inset-x-1/2 bg-[linear-gradient(105deg,transparent_42%,rgb(127_211_244/0.14)_50%,transparent_58%)] opacity-0" />
      <div className="relative">
        <SectionHeader id="finale-title" dark center title={t("title")} lead={t("lead")} />
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="#consultation" className={buttonClass("inverted", "lg")}>
            {nav("cta")}
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
