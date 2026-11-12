import { getTranslations } from "next-intl/server";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { TreatmentDrawing } from "./TreatmentDrawing";

// Three chapters (D-063): a blueprint drawing of each treatment draws itself as its chapter scrolls into view.
// Each chapter is one link — one tab stop — to its localized page.
export async function Treatments() {
  const t = await getTranslations("home.treatments");
  const nav = await getTranslations("nav");
  const chapters = [
    { key: "implants", href: "/dental-implants", title: nav("implants") },
    { key: "veneers", href: "/dental-veneers", title: nav("veneers") },
    { key: "smileDesign", href: "/smile-design", title: nav("smileDesign") },
  ] as const;

  return (
    <Section tone="ice" labelledBy="treatments-title" className="overflow-clip">
      <SectionHeader id="treatments-title" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <ul className="mt-14 grid gap-16 lg:mt-20 lg:gap-8">
        {chapters.map((chapter, i) => (
          <li
            key={chapter.key}
            data-treatment-card=""
            className="group relative grid items-center gap-8 rounded-lg [view-timeline-name:--chapter] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-blue-700 md:grid-cols-2 lg:gap-24"
          >
            <div data-draw="" data-reveal="draw" className={`chapter-art relative mx-auto aspect-square w-full max-w-sm lg:max-w-md ${i % 2 ? "md:order-2" : ""}`}>
              <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-white/70 shadow-e1 [mask-image:radial-gradient(closest-side,#000_96%,transparent)]" />
              <div aria-hidden="true" className="absolute inset-[6%] rounded-full [background-image:radial-gradient(rgb(59_77_101/0.13)_1px,transparent_1.2px)] [background-size:14px_14px] [mask-image:radial-gradient(closest-side,#000_55%,transparent)]" />
              <div className="relative size-full">
                <TreatmentDrawing name={chapter.key} />
              </div>
            </div>
            <div className="max-w-lg">
              <h3 className="font-display text-h2 font-light text-balance">
                {/* Stretched link: the whole chapter is one link and one tab stop. */}
                <Link href={chapter.href} className="outline-none after:absolute after:inset-0 after:rounded-[inherit]">
                  {chapter.title}
                </Link>
              </h3>
              <p className="mt-5 text-lead text-slate-600">{t(chapter.key)}</p>
              <span aria-hidden="true" className="mt-7 inline-flex items-center gap-2 font-semibold text-blue-700">
                {t("more")}
                <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
                  <path d="M3 8h10m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
