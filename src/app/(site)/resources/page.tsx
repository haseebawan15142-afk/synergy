import Link from "next/link";
import { fetchPublishedBlogs } from "@/lib/cms/public";
import { BlogPostCard } from "@/components/resources/BlogPostCard";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = { searchParams: Promise<{ category?: string }> };

export const metadata = {
  title: "Resources",
  description:
    "News, insights, and service updates from Synergy Computers — infrastructure, data availability, observability, and managed IT in Pakistan.",
};

/** Pick up admin CMS blog changes without a full redeploy. */
export const revalidate = 30;

export default async function ResourcesPage({ searchParams }: Props) {
  const { category: raw } = await searchParams;
  const posts = await fetchPublishedBlogs(300);
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort()];
  const category = raw && categories.includes(raw) ? raw : "All";
  const filtered = category === "All" ? posts : posts.filter((p) => p.category === category);

  return (
    <>
      <PageHeader
        title="Resources"
        description="Latest news and insights on services, partners, and enterprise technology in Pakistan."
      />
      <div className="page-container section-y-tight">
        <nav className="scroll-touch-x" aria-label="Filter by topic">
          {categories.map((cat) => {
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
    </>
  );
}
