import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/usePathname: hrefs use internal paths ("/dental-implants") and render localized slugs.
export const { Link, usePathname, getPathname } = createNavigation(routing);
