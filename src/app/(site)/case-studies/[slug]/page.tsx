import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";import { caseStudies, getCaseStudy } from "@/lib/content/case-studies";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.headline,
    description: study.summary,
    alternates: { canonical: `/case-studies/${study.slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <PageHeader title={study.headline} description={study.summary} />
      <div className="page-container max-w-3xl section-y-tight !py-12">
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border/80 shadow-card">
          <Image
            src={study.image}
            alt={study.client}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">{study.industry}</p>
            <p className="font-semibold text-ink">{study.client}</p>
          </div>
        </div>
        <ul className="mt-8 space-y-3 rounded-2xl border border-border/80 bg-surface-muted/50 p-5 sm:p-6">
          {study.metrics.map((metric) => (
            <li key={metric} className="flex items-start gap-3 text-sm text-ink-body sm:text-base">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-synergy" aria-hidden />
              {metric}
            </li>
          ))}
        </ul>

        <div className="prose prose-neutral mt-10 max-w-none prose-p:text-ink-body">
          {study.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-border pt-8">
          <Button href="/contact">Discuss your project</Button>
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-synergy hover:text-synergy-dark">
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
