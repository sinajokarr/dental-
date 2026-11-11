import { getTranslations } from "next-intl/server";

// Placeholder until the homepage is built (phase C).
export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <section className="mx-auto max-w-7xl px-6 pt-32 pb-section lg:px-12">
      <h1 className="font-display text-display font-light">{t("placeholder")}</h1>
    </section>
  );
}
