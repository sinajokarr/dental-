import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { PageIntro } from "./PageIntro";

// G08 — legal drafts. Written from what the system really does (form fields, 24 h IP throttle, minimal Telegram
// notice, one language cookie); no legal counsel yet (D-062), so every page says it is a draft and stays out of
// search engines until reviewed — a launch blocker.
export type LegalDoc = "privacy" | "kvkk" | "notice";

export async function legalMetadata(doc: LegalDoc): Promise<Metadata> {
  const t = await getTranslations("legal");
  return { title: t(`${doc}.title`), robots: { index: false, follow: true } };
}

export async function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = await getTranslations("legal");
  const sections = t.raw(`${doc}.sections`) as { title: string; body: string[] }[];
  return (
    <>
      <PageIntro title={t(`${doc}.title`)} />
      <Section>
        <p data-legal-draft="" className="max-w-3xl rounded-md border border-slate-500/40 bg-ice-50 px-5 py-4 text-small font-semibold text-navy-800">
          {t("draft")}
        </p>
        <div className="mt-12 grid max-w-3xl gap-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-h3 font-semibold">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-slate-600">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
