import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { formatPhone, telLink, waLink } from "@/lib/whatsapp";

// HOMEPAGE_UX_SPEC S10 — target of every in-page "free consultation" CTA. The form slots in as `form`.
export async function Consultation({ form, whatsappContext = "general" }: { form?: ReactNode; whatsappContext?: "general" | "implants" | "veneers" | "smile_design" | "international" }) {
  const t = await getTranslations("home.consultation");
  const nav = await getTranslations("nav");
  const steps = t.raw("next") as string[];
  const whatsapp = waLink((await getTranslations("whatsapp"))(whatsappContext));

  return (
    <Section id="consultation" labelledBy="consultation-title" className="overflow-hidden">
      <div aria-hidden="true" className="absolute -bottom-40 start-1/4 -z-0 size-[40rem] rounded-full bg-sky-100 blur-3xl" />
      <div className={`relative grid gap-12 ${form ? "lg:grid-cols-[0.9fr_1.1fr] lg:gap-20" : ""}`}>
        <div>
          <SectionHeader id="consultation-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
          <h3 className="mt-10 text-h3 font-semibold">{t("nextTitle")}</h3>
          <ol className="mt-5 grid gap-4">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-4">
                <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-small font-semibold text-blue-700">
                  {i + 1}
                </span>
                <span className="pt-1 text-slate-600">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-slate-600">{t("chat")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={whatsapp} target="_blank" rel="noopener" className={buttonClass("whatsapp", "md")}>
              <WhatsAppIcon className="size-5 text-[#128C4A]" />
              {nav("whatsapp")}
            </a>
            <p className="text-slate-600">
              {t("call")}{" "}
              <a href={telLink()} className="inline-flex min-h-11 items-center font-semibold text-blue-700 underline-offset-4 hover:underline">
                <bdi dir="ltr">{formatPhone()}</bdi>
              </a>
            </p>
          </div>
        </div>
        {form}
      </div>
    </Section>
  );
}
