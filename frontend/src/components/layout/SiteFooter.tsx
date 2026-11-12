import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { formatPhone, telLink, waLink } from "@/lib/whatsapp";
import { FooterLocales } from "./FooterLocales";
import { StickyCta } from "./StickyCta";

type Href = Parameters<typeof Link>[0]["href"];

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const whatsappHref = waLink((await getTranslations("whatsapp"))("general"));
  const groups: { title: string; links: [Href, string][] }[] = [
    { title: t("treatments"), links: [["/dental-implants", nav("implants")], ["/dental-veneers", nav("veneers")], ["/smile-design", nav("smileDesign")]] },
    { title: t("patients"), links: [["/international-patients", nav("international")], ["/free-consultation", nav("cta")]] },
    { title: t("legal"), links: [["/privacy", t("privacy")], ["/kvkk", t("kvkk")], ["/legal-notice", t("legalNotice")]] },
  ];

  return (
    <>
      <footer className="bg-band text-white">
        <div className="mx-auto max-w-7xl border-t border-white/10 px-6 py-16 lg:px-12">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div>
              <p className="flex flex-col leading-none" dir="ltr">
                <span className="text-lg font-semibold tracking-[0.08em]">JOKAR</span>{" "}
                <span className="mt-1 text-[0.625rem] font-medium tracking-[0.32em]">DENTAL</span>
              </p>
              <p className="mt-5 max-w-xs text-dark-muted">{t("tagline")}</p>
            </div>
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="eyebrow text-sky-400">{group.title}</h2>
                <ul className="mt-4 grid gap-2">
                  {group.links.map(([href, label]) => (
                    <li key={label}>
                      <Link href={href} className="inline-flex min-h-8 items-center text-dark-muted hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <h2 className="eyebrow text-sky-400">{t("contact")}</h2>
              <ul className="mt-4 grid gap-1">
                <li>
                  <a href={whatsappHref} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 text-dark-muted hover:text-white">
                    <WhatsAppIcon className="size-5 text-[#25D366]" />
                    {nav("whatsappShort")}
                  </a>
                </li>
                <li>
                  {/* The same number takes calls (D-062). */}
                  <a href={telLink()} className="inline-flex min-h-11 items-center gap-2 text-dark-muted hover:text-white">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-sky-400 stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                    </svg>
                    <bdi dir="ltr">{formatPhone()}</bdi>
                  </a>
                </li>
              </ul>
              <h2 className="eyebrow mt-8 text-sky-400">{t("languages")}</h2>
              <FooterLocales />
            </div>
          </div>
          <p className="mt-16 text-small text-dark-muted">© JOKAR DENTAL</p>
        </div>
      </footer>
      <StickyCta cta={nav("cta")} whatsapp={nav("whatsappShort")} whatsappHref={whatsappHref} />
    </>
  );
}
