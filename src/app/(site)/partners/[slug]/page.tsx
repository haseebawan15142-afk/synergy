import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { PartnerDetailHero } from "@/components/partners/PartnerDetailHero";
import { Button } from "@/components/ui/Button";
import { fetchPartnerBySlug, fetchPartners } from "@/lib/cms/public";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  const partners = await fetchPartners();
  return partners
    .map((partner) => partner.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partner = await fetchPartnerBySlug(slug);
  if (!partner) return {};
  return {
    title: `${partner.name} Partner`,
    description:
      partner.shortDescription ||
      `Synergy Computers partners with ${partner.name} to deliver enterprise IT solutions in Pakistan.`,
  };
}

export default async function PartnerDetailPage({ params }: Props) {
  const { slug } = await params;
  const partner = await fetchPartnerBySlug(slug);
  if (!partner) notFound();

  const solutions = partner.keySolutions ?? [];
  const website = partner.href && partner.href !== "#" ? partner.href : null;

  return (
    <>
      <PartnerDetailHero partner={partner} />

      <section className="section-y border-b border-border/60">
        <div className="page-container mx-auto max-w-3xl">
          {partner.category ? (
            <span className="inline-flex rounded-full border border-border/70 bg-surface-elevated px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-synergy">
              {partner.category}
            </span>
          ) : null}

          <h2 className="mt-6 text-2xl font-bold text-ink sm:text-3xl">
            About {partner.name}
          </h2>
          {partner.overview ? (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink-body sm:text-lg">
              {partner.overview}
            </p>
          ) : (
            <p className="mt-4 text-base leading-relaxed text-ink-body sm:text-lg">
              Synergy Computers works with {partner.name} to help enterprises across Pakistan
              design, implement, and support reliable technology outcomes.
            </p>
          )}

          {solutions.length > 0 ? (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-ink sm:text-3xl">
                Key Solutions & Services
              </h2>
              <ul className="mt-6 space-y-3">
                {solutions.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-body">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-synergy"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-12 rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft">
            <h3 className="text-lg font-bold text-ink">Want more detail?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-body sm:text-base">
              Explore {partner.name}&apos;s official product information on their website, or
              contact Synergy to discuss a Pakistan-based implementation.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-on-synergy shadow-card transition hover:brightness-105"
                >
                  Visit {partner.name} website
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
              <Button href="/contact" variant="secondary">
                Contact Synergy about {partner.name}
              </Button>
            </div>
          </div>

          <Link
            href="/partners"
            className="mt-8 inline-block text-sm font-semibold text-synergy hover:text-synergy-dark"
          >
            ← All partners
          </Link>
        </div>
      </section>
    </>
  );
}
