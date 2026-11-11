import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";

// Only facts the clinic has confirmed (PROJECT_BRIEF; Claims Policy) — AN-10.
const icons = [
  <path key="0" d="M4 5h16v10H9l-5 4z" />, // consultation
  <path key="1" d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />, // cities
  <path key="2" d="m3 14 18-8-5 14-3.5-5.5L3 14Zm9.5.5L16 20" />, // travel
  <path key="3" d="M4 6h9M8.5 4v2m2.5 0c-.6 3.6-3 6.8-6.5 8.5M7 9.5c1.2 1.8 3 3.2 5 4M13 20l4-9 4 9m-6.8-2.5h5.6" />, // interpreter
  <path key="4" d="M4 8l8-4 8 4v8l-8 4-8-4zm0 0 8 4 8-4m-8 4v8" />, // packages
];

export async function TrustStrip() {
  const t = await getTranslations("home.trust");
  const items = t.raw("items") as string[];
  return (
    <div className="border-y border-sky-200/70 bg-white">
      <ul aria-label={t("label")} className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-5 px-6 py-8 sm:grid-cols-3 lg:grid-cols-5 lg:px-12">
        {items.map((item, i) => (
          <li key={item} data-reveal="" style={{ "--i": i } as CSSProperties} className="flex items-center gap-3 text-small font-medium text-navy-800">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0 fill-none stroke-blue-700 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
              {icons[i]}
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
