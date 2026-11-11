import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Link } from "@/i18n/navigation";
import { waLink } from "@/lib/whatsapp";
import { FooterLocales } from "./FooterLocales";
import { StickyCta } from "./StickyCta";

type Href = Parameters<typeof Link>[0]["href"];

// "905427130132" → "+90 542 713 01 32"; any other number is shown as +digits.
const display = (number: string) => number.replace(/^(90)(\d{3})(\d{3})(\d{2})(\d{2})$/, "+$1 $2 $3 $4 $5").replace(/^(\d)/, "+$1");

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
      <footer className="bg-navy-900 text-white">
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
              <a href={whatsappHref} target="_blank" rel="noopener" className="mt-4 inline-flex min-h-11 items-center gap-2 text-dark-muted hover:text-white">
                <WhatsAppIcon className="size-5 text-[#25D366]" />
                <bdi dir="ltr">{display(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "")}</bdi>
              </a>
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
