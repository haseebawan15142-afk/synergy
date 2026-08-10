import type { SiteSettings } from "@/lib/firebase/collections";

export const DEFAULT_BRAND_MARK = "/brand/scl-mark.png";
export const DEFAULT_FAVICON = "/brand/favicon.png";

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

/** Resolve header/footer logo from Website Settings with static fallback. */
export function resolveBrandLogoSrc(input: LogoResolveInput): string {
  const logo = clean(input.logoUrl);
  const dark = clean(input.darkLogoUrl);
  const footer = clean(input.footerLogoUrl);

  if (input.variant === "footer") {
    return footer || dark || logo || DEFAULT_BRAND_MARK;
  }
  if (input.theme === "dark") {
    return dark || logo || DEFAULT_BRAND_MARK;
  }
  return logo || dark || DEFAULT_BRAND_MARK;
}

export function resolveFaviconUrl(settings?: Pick<SiteSettings, "faviconUrl"> | null) {
  return clean(settings?.faviconUrl) || DEFAULT_FAVICON;
}

export function resolveOgImageUrl(settings?: Pick<SiteSettings, "ogImageUrl"> | null) {
  return clean(settings?.ogImageUrl) || undefined;
}

export function isCustomBrandLogo(src: string) {
  return Boolean(src) && src !== DEFAULT_BRAND_MARK;
}
