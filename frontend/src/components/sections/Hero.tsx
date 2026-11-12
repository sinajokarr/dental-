import { getTranslations } from "next-intl/server";
import type { CSSProperties, ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/Magnetic";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";
import { PointerGlow } from "./PointerGlow";

// "Your <em>signature</em> smile," → words of segments. Splitting on spaces keeps punctuation glued to its
// word ("شما،"), and emphasis may span several words. Each word settles in on load (AN-04).
function words(title: string): { text: string; em: boolean }[][] {
  let em = false;
  return title
    .split(" ")
    .filter(Boolean)
    .map((token) =>
      token.split(/(<\/?em>)/).flatMap((part) => {
        if (part === "<em>" || part === "</em>") {
          em = part === "<em>";
          return [];
        }
        return part ? [{ text: part, em }] : [];
      }),
    );
}

export async function Hero({ visual }: { visual?: ReactNode }) {
  const t = await getTranslations("home.hero");
  const nav = await getTranslations("nav");
  const whatsapp = waLink((await getTranslations("whatsapp"))("general"));

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ice-50 pt-24 pb-14 lg:flex lg:min-h-svh lg:items-center lg:pt-28">
      <PointerGlow />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:px-12">
        {/* Phones: words and both calls to action first, so they are on screen at load (H01); the tooth follows. */}
        <div>
          <p className="eyebrow hero-rise mb-4 text-blue-700 [--d:200ms] lg:mb-6">{t("eyebrow")}</p>
          <h1 id="hero-title" className="font-display text-display font-light text-balance">
            {words(t.raw("title")).map((word, i) => (
              <span key={i}>
                <span className="hero-word" style={{ "--i": i } as CSSProperties}>
                  {word.map((part, j) => (part.em ? <em key={j}>{part.text}</em> : part.text))}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className="hero-rise mt-5 max-w-xl text-lead text-slate-600 [--d:350ms] lg:mt-7">{t("subtitle")}</p>
          <div className="hero-rise mt-7 flex flex-col gap-3 [--d:500ms] sm:flex-row lg:mt-10">
            <Magnetic>
              <a href="#consultation" className={`w-full sm:w-auto ${buttonClass("primary", "lg")}`}>
                {t("cta")}
              </a>
            </Magnetic>
            <a href={whatsapp} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
              <WhatsAppIcon className="size-5 text-[#128C4A]" />
              {nav("whatsapp")}
            </a>
          </div>
        </div>
        <div className="relative h-56 sm:h-72 lg:aspect-square lg:h-auto">
          <div aria-hidden="true" className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(203_186_168/0.7),rgb(232_224_216/0.5)_55%,transparent)] blur-2xl" />
          {visual}
        </div>
      </div>
    </section>
  );
}
