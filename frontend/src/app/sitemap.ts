import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { alternates, type Href } from "@/lib/seo";

// Every indexable page in every language, each with its alternates. Legal drafts are noindex until reviewed.
const PAGES: Href[] = ["/", "/dental-implants", "/dental-veneers", "/smile-design", "/international-patients", "/free-consultation", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
  return PAGES.flatMap((href) => {
    const languages = Object.fromEntries(Object.entries(alternates(href)).map(([lang, path]) => [lang, site + path]));
    return routing.locales.map((locale) => ({ url: site + getPathname({ locale, href }), alternates: { languages } }));
  });
}
