import { blogBodiesGenerated } from "./blog-bodies.generated";

export function getBlogBody(slug: string): string[] | undefined {
  const body = blogBodiesGenerated[slug];
  return body?.length ? body : undefined;
}

export function getBlogExcerpt(slug: string, maxLen = 220): string {
  const body = getBlogBody(slug);
  if (!body?.length) return "";
  const flat = body.find((b) => !b.startsWith("## ")) ?? body[0];
  if (flat.length <= maxLen) return flat;
  return `${flat.slice(0, maxLen).trim()}…`;
}
