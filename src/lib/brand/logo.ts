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
 * Resolve header/footer logo from Website Settings only.
 * Empty CMS fields mean text brand — no bundled fallback.
 */
export function resolveBrandLogoSrc(input: LogoResolveInput): string {
  const logo = clean(input.logoUrl);
  const dark = clean(input.darkLogoUrl);
  const footer = clean(input.footerLogoUrl);

  if (input.variant === "footer") {
    return footer || dark || logo;
  }
  if (input.theme === "dark") {
    return dark || footer || logo;
  }
  return logo || dark || footer;
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
