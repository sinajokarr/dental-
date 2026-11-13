import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { LeadForm } from "@/components/forms/LeadForm";
import { Cities } from "@/components/sections/Cities";
import { Consultation } from "@/components/sections/Consultation";
import { Faq } from "@/components/sections/Faq";
import { Finale } from "@/components/sections/Finale";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Treatments } from "@/components/sections/Treatments";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { WhyJokar } from "@/components/sections/WhyJokar";
import { HeroPhoto } from "@/components/sections/hero-photo/HeroPhoto";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations();
  return pageMetadata(locale, "/", { absolute: t("meta.homeTitle") }, t("home.hero.subtitle"));
}

// Structured data: only confirmed facts — no address (D-003), no ratings or prices.
const ORGANIZATION = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  name: "JOKAR DENTAL",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  telephone: `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`,
  medicalSpecialty: "Dentistry",
  availableLanguage: routing.locales,
  areaServed: [
    { "@type": "City", name: "Antalya" },
    { "@type": "City", name: "Istanbul" },
  ],
}).replace(/</g, "\\u003c");

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORGANIZATION }} />
      <Hero visual={<HeroPhoto />} />
      <TrustStrip />
      <Treatments />
      <WhyJokar />
      <Cities />
      <Journey />
      <Faq />
      <Consultation form={<LeadForm />} />
      <Finale />
    </>
  );
}
