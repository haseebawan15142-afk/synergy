import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/content/case-studies";
import {
  fetchCaseStudies,
  fetchPartners,
  fetchPublishedBlogs,
  fetchServices,
} from "@/lib/cms/public-server";
import { getSiteUrl } from "@/lib/seo/site-url";

export const revalidate = 3600;

/** Public marketing routes only — no /admin, /api, or private CMS paths. */
const staticPaths: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "weekly", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/partners", changeFrequency: "weekly", priority: 0.8 },
  { path: "/resources", changeFrequency: "daily", priority: 0.8 },
  { path: "/case-studies", changeFrequency: "monthly", priority: 0.7 },
  { path: "/newsletter", changeFrequency: "weekly", priority: 0.7 },
  { path: "/careers", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "weekly", priority: 0.9 },
];

function isPublicSlug(slug: string): boolean {
  const value = slug.trim();
  if (!value) return false;
  if (value.includes("..") || value.includes("/") || value.includes("\\")) return false;
  if (value.startsWith("admin") || value.startsWith("api")) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // CMS reads can fail in local/SSR environments; keep local content + other CMS lists independent.
  const [blogsResult, servicesResult, partnersResult, caseStudiesResult] = await Promise.allSettled([
    fetchPublishedBlogs(200),
    fetchServices(),
    fetchPartners(),
    fetchCaseStudies(),
  ]);

  if (blogsResult.status === "fulfilled") {
    for (const post of blogsResult.value) {
      if (!isPublicSlug(post.slug)) continue;
      const parsed = post.date ? new Date(post.date) : now;
      entries.push({
        url: `${base}/resources/${encodeURIComponent(post.slug)}`,
        lastModified: Number.isNaN(parsed.getTime()) ? now : parsed,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  if (servicesResult.status === "fulfilled") {
    for (const service of servicesResult.value) {
      if (!isPublicSlug(service.slug)) continue;
      entries.push({
        url: `${base}/services/${encodeURIComponent(service.slug)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  if (partnersResult.status === "fulfilled") {
    for (const partner of partnersResult.value) {
      const slug = partner.slug?.trim() ?? "";
      if (!isPublicSlug(slug)) continue;
      entries.push({
        url: `${base}/partners/${encodeURIComponent(slug)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  const studies =
    caseStudiesResult.status === "fulfilled" ? caseStudiesResult.value : caseStudies;
  for (const study of studies) {
    if (!isPublicSlug(study.slug)) continue;
    entries.push({
      url: `${base}/case-studies/${encodeURIComponent(study.slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
