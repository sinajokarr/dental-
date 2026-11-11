import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/whatsapp";
import { HeaderShell } from "./HeaderShell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const whatsappHref = waLink((await getTranslations("whatsapp"))("general"));
  const treatments = [
    { href: "/dental-implants", title: t("implants"), hint: t("implantsHint") },
    { href: "/dental-veneers", title: t("veneers"), hint: t("veneersHint") },
    { href: "/smile-design", title: t("smileDesign"), hint: t("smileDesignHint") },
  ] as const;
  const navLink = "rounded-full px-3 py-2 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-blue-700";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-60 focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-white"
      >
        {t("skip")}
      </a>
      <HeaderShell>
        <Link href="/" aria-label={t("home")} className="flex flex-col leading-none text-navy-900" dir="ltr">
          <span className="text-lg font-semibold tracking-[0.08em]">JOKAR</span>{" "}
          <span className="mt-1 text-[0.625rem] font-medium tracking-[0.32em]">DENTAL</span>
        </Link>

        <nav aria-label={t("main")} className="hidden items-center gap-2 text-sm font-medium lg:flex">
          <button type="button" popoverTarget="treatments-menu" className={`${navLink} flex items-center gap-1.5`}>
            {t("treatments")}
            <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
              <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div id="treatments-menu" popover="auto" className="glass-strong fixed inset-x-0 top-20 mx-auto my-0 w-[min(56rem,calc(100vw-3rem))] rounded-lg p-3">
            <ul className="grid gap-2 md:grid-cols-3">
              {treatments.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block h-full rounded-md p-5 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-blue-700">
                    <span className="block text-h3 font-semibold">{item.title}</span>
                    <span className="mt-2 block text-small text-slate-600">{item.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/international-patients" className={navLink}>
            {t("international")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher label={t("language")} />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            aria-label={t("whatsapp")}
            className="hidden size-11 items-center justify-center rounded-full text-[#128C4A] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-blue-700 lg:flex"
          >
            <WhatsAppIcon className="size-6" />
          </a>
          <div className="hidden lg:block">
            <Link href="/free-consultation" className={buttonClass("primary", "sm")}>
              {t("cta")}
            </Link>
          </div>
          <MobileMenu
            labels={{ menu: t("menu"), close: t("close"), cta: t("cta"), whatsapp: t("whatsapp") }}
            links={[...treatments.map(({ href, title }) => ({ href, title })), { href: "/international-patients", title: t("international") }]}
            whatsappHref={whatsappHref}
          />
        </div>
      </HeaderShell>
    </>
  );
}
