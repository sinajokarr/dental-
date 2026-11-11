import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { InternationalPage } from "@/components/sections/InternationalPage";

export default function Page() {
  return <InternationalPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata(await getLocale(), "/international-patients", t("nav.international"), t("international.lead"));
}
