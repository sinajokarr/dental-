import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import antalya from "../../../public/images/cities/antalya.jpg";
import istanbul from "../../../public/images/cities/istanbul.jpg";

// The two cities as licensed stock photos (docs/ASSET_LICENSES.md) — places, never the clinic (PROJECT_BRIEF §8).
// Each photo clips in on reveal and settles from a slight zoom with the scroll (D-063).
const CITIES = [
  { key: "antalya", src: antalya, focus: "50% 62%" },
  { key: "istanbul", src: istanbul, focus: "50% 60%" },
] as const;

export async function Cities() {
  const t = await getTranslations("cities");
  const intl = await getTranslations("international");
  return (
    <Section tone="ice" labelledBy="cities-title" className="overflow-clip">
      <SectionHeader id="cities-title" eyebrow={t("eyebrow")} title={intl("citiesTitle")} lead={intl("citiesText")} />
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:gap-8">
        {CITIES.map((city, i) => (
          <li key={city.key} data-reveal="clip" style={{ "--i": i } as CSSProperties} className="relative overflow-hidden rounded-lg shadow-e2 [view-timeline-name:--city]">
            <div className="relative aspect-[4/5] md:aspect-[4/5]">
              <Image
                src={city.src}
                alt={t(`${city.key}.alt`)}
                fill
                sizes="(min-width: 48rem) 45vw, 92vw"
                placeholder="blur"
                className="city-photo object-cover"
                style={{ objectPosition: city.focus }}
              />
            </div>
            <div className="glass-card absolute inset-x-4 bottom-4 rounded-md px-5 py-4 sm:inset-x-6 sm:bottom-6">
              <h3 className="font-display text-h3 font-light">{t(`${city.key}.name`)}</h3>
              <p className="mt-1 text-small text-slate-600">{t("treatments")}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
