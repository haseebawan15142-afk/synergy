import { isRemoteStorageUrl } from "@/lib/media/asset-url";
import type { BlogPostMeta } from "./blog-posts";

/**
 * Blog cover/card image — Firebase Storage only.
 * Local `/images/blog` and legacy synergy.net.pk URLs are intentionally ignored.
 */
export function getBlogPostImage(
  post: Pick<BlogPostMeta, "slug" | "image" | "category">,
): string | null {
  const image = String(post.image || "").trim();
  if (!image) return null;
  if (!isRemoteStorageUrl(image)) return null;
  return image;
}
