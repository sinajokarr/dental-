"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_NAMES as NAMES } from "@/i18n/locale-names";
import { routing } from "@/i18n/routing";

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
        // The popover lives in the top layer, so it cannot be positioned by its parent: place it under the button
        // when it opens (the header is fixed, so it stays there). The classes below are the fallback position.
        onBeforeToggle={(event) => {
          const menu = event.currentTarget;
          const button = menu.previousElementSibling;
          if (event.newState !== "open" || !button) return;
          const box = button.getBoundingClientRect();
          const width = document.documentElement.clientWidth;
          const end = getComputedStyle(menu).direction === "rtl" ? box.left : width - box.right;
          // ponytail: the menu is ~180px wide (hidden menus cannot be measured); keep it inside narrow screens.
          menu.style.insetInlineEnd = `${Math.max(8, Math.min(end, width - 188))}px`;
          menu.style.top = `${box.bottom + 8}px`;
        }}
        // start-auto: the browser's popover style sets `inset: 0`, which pinned the menu to the start edge.
        className="glass-strong fixed start-auto end-6 top-20 m-0 rounded-md p-2 lg:end-12"
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
