import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/whatsapp";

// G09 — localized 404: what happened and two ways forward.
export default async function NotFound() {
  const t = await getTranslations("notFound");
  const nav = await getTranslations("nav");
  const chat = await getTranslations("whatsapp");
  return (
    <section aria-labelledby="page-title" className="bg-ice-50 pt-36 pb-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p aria-hidden="true" className="font-display text-display font-light text-slate-500">404</p>
        <h1 id="page-title" className="mt-4 font-display text-h2 font-light">
          {t("title")}
        </h1>
        <p className="mt-5 text-lead text-slate-600">{t("text")}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClass("primary", "lg")}>
            {t("home")}
          </Link>
          <a href={waLink(chat("general"))} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
            <WhatsAppIcon className="size-5 text-[#128C4A]" />
            {nav("whatsapp")}
          </a>
        </div>
      </div>
    </section>
  );
}
