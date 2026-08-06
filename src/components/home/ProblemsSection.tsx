"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { problemCards } from "@/lib/content/problems";
import { services as localServices } from "@/lib/content/services";
import { fetchServices } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { Reveal } from "@/components/motion/Reveal";

export function ProblemsSection() {
  const loader = useCallback(() => fetchServices(), []);
  const services = useCmsList(localServices, loader);

  const cards = useMemo(() => {
    const problemBySlug = Object.fromEntries(
      problemCards.map((p) => [p.serviceSlug, p]),
    );
    return services.map((service) => {
      const local = problemBySlug[service.slug];
      // CMS owns title/summary/image; local problemCards only fill gaps for legacy copy.
      return {
        slug: service.slug,
        label: local?.label || service.title,
        problem: service.title || local?.problem || "",
        solution: service.summary || local?.solution || "",
        image: service.image,
      };
    });
  }, [services]);

  return (
    <section className="bg-surface-muted/80 section-y" aria-labelledby="problems-heading">
      <div className="page-container">
        <Reveal className="mb-10 flex flex-col items-stretch justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
          <SectionHeading
            id="problems-heading"
            eyebrow="Outcomes"
            title="Problems we solve"
            description="Outcome-focused solutions aligned to how enterprises operate today."
            className="max-w-2xl"
          />
          <Button href="/services" variant="secondary" className="w-full shrink-0 sm:w-auto">
            View all services
          </Button>
        </Reveal>

        <ul className="grid gap-6 sm:grid-cols-2 lg:gap-7 xl:grid-cols-3">
          {cards.map((card) => (
            <li key={card.slug} className="flex">
              <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-soft transition hover:border-slate-700 hover:shadow-card">
                {card.image ? (
                  <Link
                    href={`/services/${card.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden"
                  >
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                      aria-hidden
                    />
                    <span className="absolute left-4 top-4 rounded-md bg-surface-elevated/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-synergy shadow-sm">
                      {card.label}
                    </span>
                  </Link>
                ) : null}

                <div className="flex flex-1 flex-col bg-slate-950 p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-white sm:text-lg">{card.problem}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">{card.solution}</p>
                  <Link
                    href={`/services/${card.slug}`}
                    className="mt-5 inline-flex min-h-10 items-center text-sm font-medium text-synergy-light transition hover:text-white"
                  >
                    Learn more
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
