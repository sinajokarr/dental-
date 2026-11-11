import { getTranslations } from "next-intl/server";

// Placeholder until the homepage is built (phase C).
export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <main>
      <h1 className="font-display text-display font-light">{t("placeholder")}</h1>
    </main>
  );
}
