import { blogImagesGenerated } from "./blog-images.generated";
import type { BlogPostMeta } from "./blog-posts.generated";

const categoryFallback: Record<string, string> = {
  "Data availability": "/images/blog/data-availability-solutions-trends-2025.webp",
  RPA: "/images/blog/robotic-process-automation-solutions.webp",
  Infrastructure: "/images/blog/infrastructure-solutions-provider.webp",
  Storage: "/images/blog/object-storage-providers-pakistan.webp",
  Observability: "/images/blog/ai-powered-observability-dynatrace-pakistan.webp",
  "Managed IT": "/images/blog/future-of-managed-it-solution-providers-in-pakistan.webp",
  Security: "/images/blog/security-solutions.webp",
  Cloud: "/images/blog/trusted-it-solution-partners-2025.webp",
  "Enterprise IT": "/images/blog/it-solution-partners-pakistan-business-transformation.webp",
};

export function getBlogPostImage(
  post: Pick<BlogPostMeta, "slug" | "image" | "category">,
): string | null {
  const local = blogImagesGenerated[post.slug];
  if (local) return local;
  const fallback = categoryFallback[post.category];
  if (fallback) return fallback;
  return post.image ?? null;
}
