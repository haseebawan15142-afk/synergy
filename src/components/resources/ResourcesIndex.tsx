"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { BlogPostMeta } from "@/lib/content/blog-posts";
import { BlogPostCard } from "@/components/resources/BlogPostCard";

type ResourcesIndexProps = {
  posts: BlogPostMeta[];
};

/**
 * Client category filter so the server page can stay ISR-friendly
 * (avoids searchParams forcing a fully dynamic RSC render).
 */
export function ResourcesIndex({ posts }: ResourcesIndexProps) {
  const searchParams = useSearchParams();
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort()],
    [posts],
  );
  const raw = searchParams.get("category") || "";
  const category = raw && categories.includes(raw) ? raw : "All";
  const filtered = category === "All" ? posts : posts.filter((p) => p.category === category);

  return (
    <div className="page-container section-y-tight">
      <nav className="scroll-touch-x" aria-label="Filter by topic">
        {categories.map((cat) => {
          const href = cat === "All" ? "/resources" : `/resources?category=${encodeURIComponent(cat)}`;
          const active = cat === category;
          return (
            <Link
              key={cat}
              href={href}
              scroll={false}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-gradient-brand text-white shadow-card"
                  : "border border-border bg-surface-elevated text-ink-body shadow-soft hover:border-synergy/40"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </nav>
      <p className="mt-6 text-sm text-ink-muted">
        {filtered.length} article{filtered.length === 1 ? "" : "s"}
        {category !== "All" ? ` · ${category}` : ""}
      </p>
      <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <li key={post.slug}>
            <BlogPostCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
