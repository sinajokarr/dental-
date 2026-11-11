import type messages from "../messages/en.json";
import type { routing } from "./i18n/routing";

// Type-safe locales and message keys: using a key that is missing from en.json fails type checking.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
