import { hasLocale, IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  // Server Actions cannot read root params yet, so they pass the locale explicitly (next-intl guidance).
  const locale = explicitLocale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, locale)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      // A missing translation is a bug: fail the render/build instead of shipping a raw key.
      if (error.code === IntlErrorCode.MISSING_MESSAGE) throw error;
      console.error(error);
    },
  };
});
