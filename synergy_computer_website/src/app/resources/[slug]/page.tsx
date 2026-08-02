import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/content/blog-posts";
import { services } from "@/lib/content/services";
import { BlogPostBody } from "@/components/resources/BlogPostBody";
import { getBlogPostImage } from "@/lib/content/blog-images";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.title,
    alternates: { canonical: `/resources/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedService = services.find((s) => s.slug === post.relatedServiceSlug);
  const image = getBlogPostImage(post);

  return (
    <>
      <PageHeader title={post.title} description={post.date ? `Published ${post.date}` : undefined} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {image ? (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border/80 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={post.title} className="w-full object-cover" />
          </div>
        ) : null}
        <span className="mb-6 inline-flex rounded-full bg-synergy-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-synergy-dark">
          {post.category}
        </span>
        <BlogPostBody slug={post.slug} legacyUrl={post.legacyUrl} />
        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-border pt-8">
          {relatedService ? (
            <Link
              href={`/services/${relatedService.slug}`}
              className="text-sm font-semibold text-synergy hover:text-synergy-dark"
            >
              Related service: {relatedService.title} →
            </Link>
          ) : null}
          <Button href="/contact" variant="secondary">
            Talk to our team
          </Button>
          <Link href="/resources" className="text-sm font-semibold text-ink-body hover:text-synergy">
            ← All resources
          </Link>
        </div>
      </div>
    </>
  );
}
