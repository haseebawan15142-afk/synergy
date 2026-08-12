import type { SiteSettings } from "@/lib/firebase/collections";

export const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "Twitter / X" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "github", label: "GitHub" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "other", label: "Other" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["id"];

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  /** Optional custom icon (Media library). Empty = built-in platform icon. */
  iconUrl?: string;
  active?: boolean;
};

export function platformLabel(platform: SocialPlatform): string {
  return SOCIAL_PLATFORMS.find((p) => p.id === platform)?.label ?? "Social";
}

export function newSocialLink(platform: SocialPlatform = "other"): SocialLink {
  return {
    id: `social-${platform}-${Date.now().toString(36)}`,
    platform,
    label: platformLabel(platform),
    url: "",
    iconUrl: "",
    active: true,
  };
}

/** Build links from legacy flat fields when `socialLinks` is empty. */
export function legacySocialLinks(settings: Partial<SiteSettings>): SocialLink[] {
  const rows: SocialLink[] = [];
  const push = (platform: SocialPlatform, url?: string | null) => {
    const trimmed = String(url || "").trim();
    if (!trimmed) return;
    rows.push({
      id: `legacy-${platform}`,
      platform,
      label: platformLabel(platform),
      url: trimmed,
      active: true,
    });
  };
  push("linkedin", settings.socialLinkedin);
  push("facebook", settings.socialFacebook);
  push("twitter", settings.socialTwitter);
  push("instagram", settings.socialInstagram);
  return rows;
}

/** Active social links for the public site (CMS list, or legacy fallback). */
export function resolveSocialLinks(settings: Partial<SiteSettings>): SocialLink[] {
  const fromCms = Array.isArray(settings.socialLinks) ? settings.socialLinks : [];
  const active = fromCms
    .filter((link) => link && link.active !== false && String(link.url || "").trim())
    .map((link) => ({
      ...link,
      id: link.id || `social-${link.platform}-${link.url}`,
      platform: (link.platform || "other") as SocialPlatform,
      label: String(link.label || platformLabel((link.platform || "other") as SocialPlatform)).trim(),
      url: String(link.url).trim(),
      iconUrl: String(link.iconUrl || "").trim(),
    }));

  if (active.length) return active;
  return legacySocialLinks(settings);
}

/** Keep legacy string fields in sync for older readers. */
export function syncLegacySocialFields(links: SocialLink[]): Pick<
  SiteSettings,
  "socialLinkedin" | "socialFacebook" | "socialTwitter" | "socialInstagram"
> {
  const find = (platform: SocialPlatform) =>
    links.find((l) => l.active !== false && l.platform === platform && l.url.trim())?.url.trim() ||
    "";
  return {
    socialLinkedin: find("linkedin"),
    socialFacebook: find("facebook"),
    socialTwitter: find("twitter"),
    socialInstagram: find("instagram"),
  };
}
