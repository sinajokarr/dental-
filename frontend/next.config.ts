import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Local development reads the single repository-root .env; real environment variables win (Docker/CI).
const rootEnv = resolve(process.cwd(), "..", ".env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

for (const name of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_WHATSAPP_NUMBER"]) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name} (see .env.example)`);
}

const nextConfig: NextConfig = {
  output: "standalone", // self-contained server for the Docker image (ARCHITECTURE.md §7)
  poweredByHeader: false,
  // Next 16 defaults; both become mandatory in the next major release.
  cacheComponents: true,
  partialPrefetching: true,
  // Turbopack's persistent caches served stale CSS (dev twice; a build kept font-display: swap after the source
  // changed) — correctness over warm starts (D-071).
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createNextIntlPlugin()(nextConfig); // reads src/i18n/request.ts
