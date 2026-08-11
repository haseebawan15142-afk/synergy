import type { Metadata } from "next";
import { Suspense } from "react";
import { ResourcesIndex } from "@/components/resources/ResourcesIndex";
import { PageHeader } from "@/components/ui/PageHeader";
import { siteConfig } from "@/lib/content/site";
import { fetchPublishedBlogs } from "@/lib/cms/public-server";

export const metadata: Metadata = {
  title: "Blog | Insights",
  description:
    "News, insights, and service updates from Synergy Computers — infrastructure, data availability, observability, and managed IT in Pakistan.",
  alternates: { canonical: `${siteConfig.url}/resources` },
};

/** Pick up admin CMS blog changes without a full redeploy. */
export const revalidate = 60;

export default async function ResourcesPage() {
  const posts = await fetchPublishedBlogs(80);

  return (
    <>
      <PageHeader
        title="Blog"
        description="Latest news and insights on services, partners, and enterprise technology in Pakistan."
      />
      <Suspense fallback={<div className="page-container section-y-tight text-sm text-ink-muted">Loading…</div>}>
        <ResourcesIndex posts={posts} />
      </Suspense>
    </>
  );
}
