import type { Metadata } from "next";
import { Suspense } from "react";
import { ResourcesIndex } from "@/components/resources/ResourcesIndex";
import { ResourcesHero } from "@/components/resources/ResourcesHero";
import { siteConfig } from "@/lib/content/site";
import { fetchPublishedBlogs } from "@/lib/cms/public-server";

export const metadata: Metadata = {
  title: "Blog | Insights",
  description:
    "News, insights, and service updates from Synergy Computers — infrastructure, data availability, observability, and managed IT in Pakistan.",
  alternates: { canonical: `${siteConfig.url}/resources` },
};

/** Always read latest published blogs after admin edits (no stale ISR shell). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResourcesPage() {
  const posts = await fetchPublishedBlogs(80);

  return (
    <>
      <ResourcesHero />
      <Suspense fallback={<div className="page-container section-y-tight text-sm text-ink-muted">Loading…</div>}>
        <ResourcesIndex posts={posts} />
      </Suspense>
    </>
  );
}
