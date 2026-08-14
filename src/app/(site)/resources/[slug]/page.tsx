import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBlogBySlug, fetchPublishedBlogs, fetchServices } from "@/lib/cms/public";
import { BlogPostBody } from "@/components/resources/BlogPostBody";
import { getBlogPostImage } from "@/lib/content/blog-images";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await fetchPublishedBlogs(300);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `/resources/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  if (!post) notFound();

  const services = await fetchServices();
  const relatedService = services.find((s) => s.slug === post.relatedServiceSlug);
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
            <Image
              src={image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              unoptimized
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
