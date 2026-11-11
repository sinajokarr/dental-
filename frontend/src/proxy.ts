import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale detection and redirects: `/` → /<locale> via cookie, then Accept-Language, else /en (D-011, D-020).
export default createMiddleware(routing);

export const config = {
  // Every path except Next.js internals and files with an extension (e.g. /favicon.ico).
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
