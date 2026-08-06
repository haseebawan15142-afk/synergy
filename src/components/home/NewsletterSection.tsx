"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsletterIssues as localIssues } from "@/lib/content/newsletter-issues";
import { fetchNewsletterIssues } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function NewsletterSection() {
  const loader = useCallback(() => fetchNewsletterIssues(), []);
  const issues = useCmsList(localIssues, loader).slice(0, 4);

  if (!issues.length) return null;

  const [featured, ...rest] = issues;

  return (
    <section className="section-y bg-surface-elevated/60" aria-labelledby="newsletter-heading">
      <div className="page-container">
        <Reveal className="flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            id="newsletter-heading"
            eyebrow="Newsletter"
            title="Partner & technology editions"
            description="Dynatrace, data platforms, and enterprise IT updates — curated for Pakistani organizations."
          />
          <Button href="/newsletter" variant="secondary" className="w-full shrink-0 sm:w-auto">
            View newsletter
          </Button>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-5 lg:gap-8">
          <Reveal className="lg:col-span-3">
            <Link href={featured.href || "/newsletter"} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                <Image
                  src={featured.coverUrl}
                  alt={featured.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-synergy">
                {featured.topic}
              </p>
              <h3 className="mt-2 text-xl font-bold text-ink group-hover:text-synergy sm:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-body sm:text-base">
                {featured.excerpt}
              </p>
            </Link>
          </Reveal>

          <ul className="flex flex-col gap-5 lg:col-span-2">
            {rest.map((issue, i) => (
              <li key={issue.slug}>
                <Reveal delay={0.05 * (i + 1)}>
                  <Link
                    href={issue.href || "/newsletter"}
                    className="group flex gap-4 border-b border-border/50 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-surface-muted sm:h-24 sm:w-32">
                      <Image
                        src={issue.coverUrl}
                        alt=""
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="128px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-synergy">
                        {issue.topic}
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-ink group-hover:text-synergy sm:text-base">
                        {issue.title}
                      </h4>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
