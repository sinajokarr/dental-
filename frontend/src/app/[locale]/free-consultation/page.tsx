import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/forms/LeadForm";
import { Consultation } from "@/components/sections/Consultation";
import { Faq } from "@/components/sections/Faq";
import { PageIntro } from "@/components/sections/PageIntro";

// G06 — the target of every header and menu CTA: the form first, the common questions after it.
export default async function FreeConsultationPage() {
  const t = await getTranslations("consultationPage");
  return (
    <>
      <PageIntro title={t("title")} lead={t("lead")} />
      <Consultation form={<LeadForm />} />
      <Faq />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata(await getLocale(), "/free-consultation", t("consultationPage.title"), t("consultationPage.lead"));
}
