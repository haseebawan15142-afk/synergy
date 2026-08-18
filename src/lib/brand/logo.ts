import type { SiteSettings } from "@/lib/firebase/collections";

type LogoResolveInput = {
  variant?: "header" | "footer";
  theme?: "light" | "dark";
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  footerLogoUrl?: string | null;
};

function clean(url?: string | null) {
  return String(url || "").trim();
}

/**
 * Resolve header/footer logo from Website Settings, with the previous
 * Synergy mark as local fallback (never the digital ChatGPT logo).
 */
export function resolveBrandLogoSrc(input: LogoResolveInput): string {
  const logo = clean(input.logoUrl);
  const dark = clean(input.darkLogoUrl);
  const footer = clean(input.footerLogoUrl);
  const localFallback = "/brand/logo.png";

  if (input.variant === "footer") {
    return footer || dark || logo || localFallback;
  }
  if (input.theme === "dark") {
    return dark || footer || logo || localFallback;
  }
  return logo || dark || footer || localFallback;
}

export function resolveFaviconUrl(settings?: Pick<SiteSettings, "faviconUrl"> | null) {
  return clean(settings?.faviconUrl) || undefined;
}

export function resolveOgImageUrl(settings?: Pick<SiteSettings, "ogImageUrl"> | null) {
  return clean(settings?.ogImageUrl) || undefined;
}

/** True when we have a CMS-hosted mark (not text-only brand). */
export function hasBrandLogoSrc(src?: string | null) {
  return Boolean(clean(src));
}
