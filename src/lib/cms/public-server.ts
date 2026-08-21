import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  fetchActiveEventHeroVideos as fetchActiveEventHeroVideosUncached,
  fetchCaseStudies as fetchCaseStudiesUncached,
  fetchFooterNav as fetchFooterNavUncached,
  fetchLandingHeroVideos as fetchLandingHeroVideosUncached,
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
 * Blogs stay uncached here so admin publish is visible immediately; the
 * /resources routes also use force-dynamic + revalidateTag("cms-blogs").
 *
 * Client components must keep using `@/lib/cms/public` (browser Firestore).
 */

export const fetchSiteSettings = cache(
  unstable_cache(async () => fetchSiteSettingsUncached(), ["cms:settings:site:v7"], {
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

/** Fresh Firestore read every request (admin publish must show immediately). */
export const fetchPublishedBlogs = cache(async (max = 80) => fetchPublishedBlogsUncached(max));

export const fetchServices = cache(
  unstable_cache(async () => fetchServicesUncached(), ["cms:services:v10"], {
    revalidate: 60,
    tags: ["cms-services"],
  }),
);

export const fetchPartners = cache(
  unstable_cache(async () => fetchPartnersUncached(), ["cms:partners:v6"], {
    revalidate: 60,
    tags: ["cms-partners"],
  }),
);

export const fetchCaseStudies = cache(
  unstable_cache(async () => fetchCaseStudiesUncached(), ["cms:caseStudies:v1"], {
    revalidate: 60,
    tags: ["cms-case-studies"],
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
    ["cms:theme:active-hero-videos:v4"],
    { revalidate: 10, tags: ["cms-theme"] },
  ),
);

export const fetchLandingHeroVideos = cache(
  unstable_cache(
    async () => fetchLandingHeroVideosUncached(),
    ["cms:settings:landing-hero-videos:v2"],
    { revalidate: 10, tags: ["cms-settings"] },
  ),
);
