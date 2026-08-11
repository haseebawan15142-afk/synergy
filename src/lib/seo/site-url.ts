import { siteConfig } from "@/lib/content/site";

/**
 * Canonical production origin for sitemap/robots/metadata.
 * Prefers NEXT_PUBLIC_SITE_URL when set; never falls back to localhost.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      const url = new URL(fromEnv.includes("://") ? fromEnv : `https://${fromEnv}`);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return siteConfig.url.replace(/\/$/, "");
      }
      return url.origin.replace(/\/$/, "");
    } catch {
      /* use siteConfig */
    }
  }
  return siteConfig.url.replace(/\/$/, "");
}
