import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  fetchActiveEventHeroVideos as fetchActiveEventHeroVideosUncached,
  fetchFooterNav as fetchFooterNavUncached,
  fetchNewsletterIssues as fetchNewsletterIssuesUncached,
  fetchOffices as fetchOfficesUncached,
  fetchPartners as fetchPartnersUncached,
  fetchPublishedBlogs as fetchPublishedBlogsUncached,
  fetchServices as fetchServicesUncached,
  fetchSiteSettings as fetchSiteSettingsUncached,
} from "@/lib/cms/public";

/**
 * Server-only CMS reads with:
 * - React `cache()` — dedupe within one request (layout + page + metadata)
 * - `unstable_cache` — Next Data Cache across requests (ISR-friendly)
 *
 * Client components must keep using `@/lib/cms/public` (browser Firestore).
 */

export const fetchSiteSettings = cache(
  unstable_cache(async () => fetchSiteSettingsUncached(), ["cms:settings:site:v3"], {
    revalidate: 60,
    tags: ["cms-settings"],
  }),
);

export const fetchOffices = cache(
  unstable_cache(async () => fetchOfficesUncached(), ["cms:offices:v3"], {
    revalidate: 60,
    tags: ["cms-offices"],
  }),
);

const publishedBlogsLoaders = new Map<number, () => Promise<Awaited<ReturnType<typeof fetchPublishedBlogsUncached>>>>();

function publishedBlogsCached(max: number) {
  const key = Math.min(Math.max(1, max), 500);
  let loader = publishedBlogsLoaders.get(key);
  if (!loader) {
    loader = unstable_cache(
      async () => fetchPublishedBlogsUncached(key),
      [`cms:blogs:published:v3:${key}`],
      { revalidate: 60, tags: ["cms-blogs"] },
    );
    publishedBlogsLoaders.set(key, loader);
  }
  return loader();
}

export const fetchPublishedBlogs = cache(async (max = 80) => publishedBlogsCached(max));

export const fetchServices = cache(
  unstable_cache(async () => fetchServicesUncached(), ["cms:services:v3"], {
    revalidate: 60,
    tags: ["cms-services"],
  }),
);

export const fetchPartners = cache(
  unstable_cache(async () => fetchPartnersUncached(), ["cms:partners:v3"], {
    revalidate: 60,
    tags: ["cms-partners"],
  }),
);

export const fetchFooterNav = cache(
  unstable_cache(async () => fetchFooterNavUncached(), ["cms:nav:footer:v3"], {
    revalidate: 60,
    tags: ["cms-nav"],
  }),
);

export const fetchNewsletterIssues = cache(
  unstable_cache(async () => fetchNewsletterIssuesUncached(), ["cms:newsletter:issues:v3"], {
    revalidate: 60,
    tags: ["cms-newsletter"],
  }),
);

export const fetchActiveEventHeroVideos = cache(
  unstable_cache(
    async () => fetchActiveEventHeroVideosUncached(),
    ["cms:theme:active-hero-videos:v3"],
    { revalidate: 30, tags: ["cms-theme"] },
  ),
);
