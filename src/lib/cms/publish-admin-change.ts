import { invalidateCmsCache } from "@/lib/cms/cache";
import { requestPublicCmsRevalidate } from "@/lib/cms/revalidate-client";

/** Map Firestore collection → Next Data Cache tags. */
const COLLECTION_TAGS: Record<string, string[]> = {
  blogs: ["cms-blogs"],
  settings: ["cms-settings"],
  theme: ["cms-theme"],
  themePresets: ["cms-theme"],
  offices: ["cms-offices"],
  services: ["cms-services"],
  partners: ["cms-partners"],
  clients: ["cms-clients"],
  caseStudies: ["cms-case-studies"],
  navigation: ["cms-nav"],
  newsletterIssues: ["cms-newsletter"],
};

const COLLECTION_CACHE_PREFIX: Record<string, string> = {
  blogs: "blogs",
  settings: "settings",
  theme: "theme",
  themePresets: "theme",
  offices: "offices",
  services: "services",
  partners: "partners",
  clients: "clients",
  caseStudies: "caseStudies",
  navigation: "nav",
  newsletterIssues: "newsletter",
};

/**
 * After any admin CMS write: clear browser CMS map + bust Next ISR/Data Cache
 * so the public site shows the change immediately.
 */
export async function publishAdminCmsChange(
  collection: string,
  extraPaths: string[] = [],
): Promise<void> {
  const prefix = COLLECTION_CACHE_PREFIX[collection] || collection;
  invalidateCmsCache(prefix);

  const tags = COLLECTION_TAGS[collection] || ["cms-settings"];
  const paths = [
    "/",
    ...(collection === "blogs" ? ["/resources"] : []),
    ...(collection === "caseStudies" ? ["/case-studies"] : []),
    ...(collection === "services" ? ["/services"] : []),
    ...(collection === "partners" ? ["/partners"] : []),
    ...extraPaths,
  ];

  const ok = await requestPublicCmsRevalidate(tags, [...new Set(paths)]);
  if (!ok && typeof window !== "undefined") {
    console.warn(`[cms] Public revalidate failed for ${collection} — hard-refresh the site`);
  }
}
