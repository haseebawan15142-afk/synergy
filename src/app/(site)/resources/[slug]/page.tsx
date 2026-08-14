import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBlogBySlug, fetchServices } from "@/lib/cms/public";
import { BlogPostBody } from "@/components/resources/BlogPostBody";
import { getBlogPostImage } from "@/lib/content/blog-images";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchBlogBySlug(slug);
    if (!post) return {};
    return {
      title: post.title,
      description: post.excerpt || post.title,
      alternates: { canonical: `/resources/${post.slug}` },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = await fetchBlogBySlug(slug);
  } catch {
    post = null;
  }
  if (!post) notFound();

  let relatedService = null;
  try {
    const services = await fetchServices();
    relatedService = services.find((s) => s.slug === post.relatedServiceSlug) || null;
  } catch {
    relatedService = null;
  }
  const image = getBlogPostImage(post);

  return (
    <>
      <PageHeader
        title={post.title}
        description={post.date ? `Published ${post.date.slice(0, 10)}` : undefined}
      />
      <div className="page-container max-w-3xl section-y-tight !py-10">
        {image ? (
          <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl border border-border/80 shadow-card sm:aspect-[2/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : null}
        <span className="mb-6 inline-flex rounded-full bg-synergy-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-synergy-dark">
          {post.category}
        </span>
        <BlogPostBody slug={post.slug} legacyUrl={post.legacyUrl} bodyHtml={post.bodyHtml} />
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
