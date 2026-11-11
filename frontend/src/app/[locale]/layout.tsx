import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { preload } from "react-dom";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!), // presence enforced in next.config.ts
  title: { template: "%s | JOKAR DENTAL", default: "JOKAR DENTAL" },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  // Only the fonts this locale renders above the fold (D-049): Persian never downloads the Latin faces, and vice versa.
  // The italic is in the hero headline; with font-display: optional (D-071) an unpreloaded face would miss its turn.
  const fonts = locale === "fa" ? ["vazirmatn"] : ["cormorant-garamond", "cormorant-garamond-italic", "manrope"];
  for (const font of fonts) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
      <body>
        {/* Locale for client components; messages={null}: client components get their text as props, so no translations ship to the browser. */}
        <NextIntlClientProvider messages={null}>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
