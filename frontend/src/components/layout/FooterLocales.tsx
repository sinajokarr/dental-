"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_NAMES } from "@/i18n/locale-names";
import { routing } from "@/i18n/routing";

// Same page in every language (needs the current pathname, hence client).
export function FooterLocales() {
  const pathname = usePathname();
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {routing.locales.map((locale) => (
        <li key={locale}>
          <Link href={pathname} locale={locale} lang={locale} hrefLang={locale} className="text-dark-muted hover:text-white">
            {LOCALE_NAMES[locale]}
          </Link>
        </li>
      ))}
    </ul>
  );
}
