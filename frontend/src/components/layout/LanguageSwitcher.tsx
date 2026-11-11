"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Native language names, never flags (D-021). Each entry links to the same page in that language.
const NAMES = { fa: "فارسی", en: "English", de: "Deutsch", tr: "Türkçe" } as const;

export function LanguageSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div>
      <button
        type="button"
        popoverTarget="language-menu"
        className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold uppercase tracking-wide hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        {/* Visible code stays inside the accessible name (WCAG 2.5.3 label in name). */}
        <span className="sr-only">{label}: </span>
        {locale}
        <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <nav
        id="language-menu"
        popover="auto"
        aria-label={label}
        className="glass-strong fixed end-6 top-20 m-0 rounded-md p-2 lg:end-12"
      >
        <ul className="grid gap-1">
          {routing.locales.map((target) => (
            <li key={target}>
              <Link
                href={pathname}
                locale={target}
                lang={target}
                hrefLang={target}
                aria-current={target === locale ? "true" : undefined}
                className="block min-w-36 rounded-sm px-4 py-2.5 hover:bg-sky-100 aria-[current]:font-semibold aria-[current]:text-blue-700"
              >
                {NAMES[target]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
