import Link from "next/link";
import { blogCategories, getBlogPostsByCategory, isBlogCategory } from "@/lib/content/blog-posts";
import { BlogPostCard } from "@/components/resources/BlogPostCard";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = { searchParams: Promise<{ category?: string }> };

export const metadata = {
  title: "Resources",
  description:
    "News, insights, and service updates from Synergy Computers — infrastructure, data availability, observability, and managed IT in Pakistan.",
};

export default async function ResourcesPage({ searchParams }: Props) {
  const { category: raw } = await searchParams;
  const category = isBlogCategory(raw) ? raw : "All";
  const posts = getBlogPostsByCategory(category);

  return (
    <>
      <PageHeader
        title="Resources"
        description="Latest news and insights on services, partners, and enterprise technology in Pakistan."
      />
      <div className="page-container section-y-tight">
        <nav className="scroll-touch-x" aria-label="Filter by topic">
          {blogCategories.map((cat) => {
            const href = cat === "All" ? "/resources" : `/resources?category=${encodeURIComponent(cat)}`;
            const active = cat === category;
            return (
              <Link
                key={cat}
                href={href}
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
          {posts.length} article{posts.length === 1 ? "" : "s"}
          {category !== "All" ? ` · ${category}` : ""}
        </p>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
