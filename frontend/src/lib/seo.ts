// Page metadata for every locale (MULTILINGUAL_SEO_ARCHITECTURE): canonical and hreflang use the localized slugs;
// relative URLs become absolute through metadataBase (NEXT_PUBLIC_SITE_URL) in the layout.
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export type Href = keyof typeof routing.pathnames;
const OG_LOCALE: Record<Locale, string> = { fa: "fa_IR", en: "en_GB", de: "de_DE", tr: "tr_TR" };

/** Localized path of an internal route for each locale, plus x-default (English). */
export function alternates(href: Href): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(routing.locales.map((l) => [l, getPathname({ locale: l, href })]));
  return { ...languages, "x-default": languages.en };
}

export function pageMetadata(locale: Locale, href: Href, title: Metadata["title"], description?: string): Metadata {
  const url = getPathname({ locale, href });
  const plain = typeof title === "string" ? title : title && "absolute" in title ? title.absolute : undefined;
  return {
    title,
    description,
    alternates: { canonical: url, languages: alternates(href) },
    openGraph: { title: plain, description, url, siteName: "JOKAR DENTAL", locale: OG_LOCALE[locale], type: "website" },
  };
}
