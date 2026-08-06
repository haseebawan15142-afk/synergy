import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPostCard } from "@/components/resources/BlogPostCard";
import { ServiceDetailHero } from "@/components/services/ServiceDetailHero";
import { ServiceDetailSections } from "@/components/services/ServiceDetailSections";
import { fetchPublishedBlogs, fetchServiceBySlug, fetchServices } from "@/lib/cms/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await fetchServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await fetchServiceBySlug(slug);
  if (!resolved) return {};
  return {
    title: resolved.service.title,
    description: resolved.detail.lead || resolved.service.summary,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await fetchServiceBySlug(slug);
  if (!resolved) notFound();

  const { service, detail } = resolved;
  const relatedPosts = (await fetchPublishedBlogs(80))
    .filter((p) => p.relatedServiceSlug === slug)
    .slice(0, 4);

  return (
    <>
      <ServiceDetailHero
        title={service.title}
        summary={service.summary}
        heroImage={detail.heroImage}
      />
      <ServiceDetailSections detail={detail} />

      {relatedPosts.length > 0 ? (
        <section className="border-t border-border/60 bg-surface-muted/40 section-y">
          <div className="page-container">
            <h2 className="text-section-title font-display font-bold text-ink">
              Related insights
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-body sm:text-base">
              Articles related to {service.title.toLowerCase()} from our resources library.
            </p>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <BlogPostCard post={post} compact />
                </li>
              ))}
            </ul>
            <Link
              href="/resources"
              className="mt-8 inline-block text-sm font-semibold text-synergy hover:text-synergy-dark"
            >
              Browse all resources →
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
