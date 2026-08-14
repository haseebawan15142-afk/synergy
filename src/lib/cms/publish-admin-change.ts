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

  const tags = COLLECTION_TAGS[collection] || [];
  const paths =
    collection === "blogs"
      ? ["/resources", ...extraPaths]
      : collection === "theme" || collection === "themePresets"
        ? ["/", ...extraPaths]
        : extraPaths;

  if (tags.length || paths.length) {
    await requestPublicCmsRevalidate(tags.length ? tags : ["cms-theme"], paths);
  }
}
