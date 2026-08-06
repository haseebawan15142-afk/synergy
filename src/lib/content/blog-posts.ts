import {
  blogPostsGenerated,
  type BlogPostMeta as GeneratedBlogPostMeta,
} from "./blog-posts.generated";

export type BlogPostMeta = GeneratedBlogPostMeta & {
  /** Rich HTML from admin CMS (Firebase). */
  bodyHtml?: string;
  excerpt?: string;
};

function parseBlogDate(dateStr: string): number {
  const normalized = dateStr.replace(/octaber/i, "October");
  const t = Date.parse(normalized);
  return Number.isNaN(t) ? 0 : t;
}

/** Legacy index lists some articles twice (with and without `blog-` in the URL). */
function dedupeBlogPosts(posts: BlogPostMeta[]): BlogPostMeta[] {
  const bySlug = new Map<string, BlogPostMeta>();
  for (const post of posts) {
    const prev = bySlug.get(post.slug);
    if (!prev) {
      bySlug.set(post.slug, post);
      continue;
    }
    const score = (p: BlogPostMeta) =>
      (p.legacyUrl.includes("/blog-") ? 4 : 0) + (p.image ? 2 : 0);
    bySlug.set(post.slug, score(post) >= score(prev) ? post : prev);
  }
  return [...bySlug.values()].sort((a, b) => parseBlogDate(b.date) - parseBlogDate(a.date));
}

export const blogPosts: BlogPostMeta[] = dedupeBlogPosts(blogPostsGenerated);

export const blogCategories = [
  "All",
  ...Array.from(new Set(blogPosts.map((p) => p.category))).sort(),
];

export function isBlogCategory(value: string | undefined): value is string {
  return !!value && (value === "All" || blogPosts.some((p) => p.category === value));
}

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRecentBlogPosts(limit = 6): BlogPostMeta[] {
  return blogPosts.slice(0, limit);
}

export function getBlogPostsByService(serviceSlug: string, limit?: number): BlogPostMeta[] {
  const list = blogPosts.filter((p) => p.relatedServiceSlug === serviceSlug);
  return limit ? list.slice(0, limit) : list;
}

export function getBlogPostsByCategory(category: string): BlogPostMeta[] {
  if (category === "All") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}
