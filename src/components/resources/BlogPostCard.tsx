import Image from "next/image";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/content/blog-posts";
import { getBlogExcerpt } from "@/lib/content/blog-bodies";
import { getBlogPostImage } from "@/lib/content/blog-images";
import { MotionCard } from "@/components/motion/MotionCard";

type BlogPostCardProps = {
  post: BlogPostMeta;
  compact?: boolean;
};

export function BlogPostCard({ post, compact }: BlogPostCardProps) {
  const excerpt = post.excerpt?.trim() || getBlogExcerpt(post.slug);
  const image = getBlogPostImage(post);

  const article = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated shadow-soft transition hover:-translate-y-1 hover:border-synergy/30 hover:shadow-card">
      {image ? (
        <Link
          href={`/resources/${post.slug}`}
          className="relative block aspect-[16/10] overflow-hidden bg-surface-muted"
        >
          <Image
            src={image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-60" />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-muted">
          {post.date ? <time dateTime={post.date}>{post.date}</time> : null}
          <span className="rounded-full bg-synergy-muted px-2.5 py-0.5 font-semibold text-synergy-dark">
            {post.category}
          </span>
        </div>
        <h3 className={`mt-3 font-semibold text-ink ${compact ? "text-base" : "text-lg"}`}>
          <Link href={`/resources/${post.slug}`} className="hover:text-synergy">
            {post.title}
          </Link>
        </h3>
        {!compact && excerpt ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-body">{excerpt}</p>
        ) : null}
        <Link
          href={`/resources/${post.slug}`}
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-synergy transition group-hover:gap-2"
        >
          Read more <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );

  return (
    <MotionCard className="h-full" reveal>
      {article}
    </MotionCard>
  );
}
