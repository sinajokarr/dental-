"use client";

import { useLocale } from "next-intl";
import { buttonClass } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";

// G09 — unexpected error. Client components get no message catalog here (messages={null} in the layout), so
// the few words (and the general WhatsApp message, as in messages/*.json) live inline.
const TEXT = {
  fa: ["مشکلی پیش آمد", "لطفاً دوباره تلاش کنید. اگر تکرار شد، در واتس‌اپ به ما پیام دهید.", "تلاش دوباره", "واتس‌اپ", "سلام، وقت بخیر. مایل به دریافت مشاوره رایگان از JOKAR DENTAL هستم."],
  en: ["Something went wrong", "Please try again. If it keeps happening, message us on WhatsApp.", "Try again", "WhatsApp", "Hello JOKAR DENTAL, I'd like to request a free consultation."],
  de: ["Etwas ist schiefgelaufen", "Bitte versuchen Sie es erneut. Wenn es wieder passiert, schreiben Sie uns per WhatsApp.", "Erneut versuchen", "WhatsApp", "Hallo JOKAR DENTAL, ich möchte eine kostenlose Beratung anfragen."],
  tr: ["Bir sorun oluştu", "Lütfen tekrar deneyin. Sorun devam ederse bize WhatsApp'tan yazın.", "Tekrar deneyin", "WhatsApp", "Merhaba JOKAR DENTAL, ücretsiz danışmanlık almak istiyorum."],
} as const;

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const locale = useLocale() as keyof typeof TEXT;
  const [title, text, retry, whatsapp, message] = TEXT[locale] ?? TEXT.en;
  return (
    <section aria-labelledby="error-title" className="bg-ice-50 pt-36 pb-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 id="error-title" className="font-display text-h2 font-light">
          {title}
        </h1>
        <p className="mt-5 text-lead text-slate-600">{text}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className={buttonClass("primary", "lg")}>
            {retry}
          </button>
          <a href={waLink(message)} target="_blank" rel="noopener" className={buttonClass("whatsapp", "lg")}>
            {whatsapp}
          </a>
        </div>
      </div>
    </section>
  );
}
