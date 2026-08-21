import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchCaseStudies } from "@/lib/cms/public-server";
import { siteConfig } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Customer success stories from Synergy Computers — infrastructure, data protection, and managed IT outcomes across Pakistan.",
  alternates: { canonical: `${siteConfig.url}/case-studies` },
};

export const revalidate = 60;

export default async function CaseStudiesPage() {
  const studies = await fetchCaseStudies();

  return (
    <>
      <PageHeader
        title="Case studies"
        description="Outcomes from enterprise and institutional engagements across Pakistan."
      />
      <ul className="page-container section-y-tight grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {studies.map((study) => (
          <li key={study.slug}>
            <Link
              href={`/case-studies/${study.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft transition hover:border-synergy"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={study.image}
                  alt={study.client}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {study.industry}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">{study.client}</p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{study.headline}</h2>
                <p className="mt-2 flex-1 text-sm text-ink-body">{study.summary}</p>
                <span className="mt-4 text-sm font-semibold text-synergy group-hover:underline">
                  Read case study
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
