import { defineRouting } from "next-intl/routing";

// Locales, default and localized slugs: docs/MULTILINGUAL_SEO_ARCHITECTURE.md §2 (D-011, D-018).
export const routing = defineRouting({
  locales: ["fa", "en", "de", "tr"],
  defaultLocale: "en",
  localePrefix: "always",
  alternateLinks: false, // hreflang comes from page metadata (task F06)
  pathnames: {
    "/": "/",
    "/dental-implants": { fa: "/dental-implants", en: "/dental-implants", de: "/zahnimplantate", tr: "/dis-implanti" },
    "/dental-veneers": { fa: "/dental-veneers", en: "/dental-veneers", de: "/veneers", tr: "/porselen-lamina" },
    "/smile-design": { fa: "/smile-design", en: "/smile-design", de: "/smile-design", tr: "/gulus-tasarimi" },
    "/international-patients": {
      fa: "/international-patients",
      en: "/international-patients",
      de: "/internationale-patienten",
      tr: "/uluslararasi-hastalar",
    },
    "/free-consultation": {
      fa: "/free-consultation",
      en: "/free-consultation",
      de: "/kostenlose-beratung",
      tr: "/ucretsiz-danismanlik",
    },
    "/about": { fa: "/about", en: "/about", de: "/ueber-uns", tr: "/hakkimizda" },
    "/privacy": { fa: "/privacy", en: "/privacy", de: "/datenschutz", tr: "/gizlilik" },
    "/kvkk": { fa: "/kvkk", en: "/kvkk", de: "/kvkk", tr: "/kvkk-aydinlatma-metni" },
    "/legal-notice": { fa: "/legal-notice", en: "/legal-notice", de: "/impressum", tr: "/yasal-bilgiler" },
  },
});
