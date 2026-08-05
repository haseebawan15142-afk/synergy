import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { BlogPostCard } from "@/components/resources/BlogPostCard";
import { services } from "@/lib/content/services";
import { getBlogPostsByService } from "@/lib/content/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return { title: service.title, description: service.summary };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const relatedPosts = getBlogPostsByService(slug, 4);

  return (
    <>
      <PageHeader title={service.title} description={service.summary} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-ink-body">
          Contact us for a tailored quote and scope aligned to your environment. We partner with
          leading technology principals and deliver implementation, support, and maintenance across
          Pakistan.
        </p>
        <div className="mt-8 flex gap-4">
          <Button href="/contact">Request a quote</Button>
          <Link href="/services" className="text-sm font-semibold text-synergy hover:text-synergy-dark">
            ← All services
          </Link>
        </div>
        {relatedPosts.length > 0 ? (
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="text-xl font-bold text-ink">Recent updates</h2>
            <p className="mt-2 text-sm text-ink-body">
              Articles related to {service.title.toLowerCase()} from our resources library.
            </p>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <BlogPostCard post={post} compact />
                </li>
              ))}
            </ul>
            <Link href="/resources" className="mt-6 inline-block text-sm font-semibold text-synergy">
              Browse all resources →
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
