import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { preload } from "react-dom";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!), // presence enforced in next.config.ts
  title: "JOKAR DENTAL",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  // Only the fonts this locale renders above the fold (D-049): Persian never downloads the Latin faces, and vice versa.
  const fonts = locale === "fa" ? ["vazirmatn"] : ["cormorant-garamond", "manrope"];
  for (const font of fonts) preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
      <body>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
