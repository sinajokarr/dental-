import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";

// Five advantages, each traceable to a confirmed fact in PROJECT_BRIEF (AN-15).
export async function WhyJokar() {
  const t = await getTranslations("home.why");
  const items = t.raw("items") as { title: string; text: string }[];

  return (
    <Section labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeader id="why-title" eyebrow={t("eyebrow")} title={t("title")} />
          <div data-reveal="clip" className="porcelain-edge relative mt-10 hidden aspect-[4/5] max-w-sm overflow-hidden rounded-lg [--edge-fill:var(--color-ice-50)] lg:block">
            <Image src="/images/hero/tooth-poster.png" alt="" fill sizes="24rem" className="object-cover" />
          </div>
        </div>
        <div>
          <ol className="divide-y divide-sky-200">
            {items.map((item, i) => (
              <li key={item.title} data-reveal="" style={{ "--i": i } as CSSProperties} className="grid grid-cols-[auto_1fr] gap-x-6 py-7 first:pt-0">
                <span aria-hidden="true" className="font-display text-h2 font-light leading-none text-sky-400">0{i + 1}</span>
                <div>
                  <h3 className="text-h3 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-slate-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/international-patients" className="group mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 underline-offset-4 hover:underline">
            {t("link")}
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 rtl:-scale-x-100">
              <path d="M3 8h10m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </Section>
  );
}
