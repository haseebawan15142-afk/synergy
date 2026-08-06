"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getRecentBlogPosts } from "@/lib/content/blog-posts";
import { fetchPublishedBlogs } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { BlogPostCard } from "@/components/resources/BlogPostCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function RecentUpdatesSection() {
  const loader = useCallback(async () => {
    const all = await fetchPublishedBlogs(12);
    return all.slice(0, 6);
  }, []);
  const posts = useCmsList(getRecentBlogPosts(6), loader);

  return (
    <section
      className="border-y border-border/60 bg-surface-muted/50 section-y"
      aria-labelledby="updates-heading"
    >
      <div className="page-container">
        <Reveal className="flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            id="updates-heading"
            eyebrow="Recent updates"
            title="News & service insights"
            description="Articles on data availability, infrastructure, observability, managed IT, and partner solutions in Pakistan."
          />
          <Button href="/resources" variant="secondary" className="w-full shrink-0 sm:w-auto">
            View all articles
          </Button>
        </Reveal>
        <ul className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogPostCard post={post} compact />
            </li>
          ))}
        </ul>
        <Reveal className="mt-8 text-center sm:mt-10" variant="fadeIn" delay={0.05}>
          <p className="text-sm text-ink-muted">
            Browse by topic on{" "}
            <Link href="/resources" className="font-semibold text-synergy hover:underline">
              Resources
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
