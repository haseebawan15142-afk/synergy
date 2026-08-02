import Link from "next/link";
import {
  isServiceIconKey,
  ServiceCategoryIcon,
} from "@/components/icons/ServiceCategoryIcons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { problemCards } from "@/lib/content/problems";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";

export function ProblemsSection() {
  return (
    <section className="bg-surface-muted/80 section-y" aria-labelledby="problems-heading">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="problems-heading"
            align="center"
            eyebrow="Outcomes"
            title="Problems we solve"
            description="Outcome-focused solutions aligned to how enterprises operate today."
            className="mb-10 sm:mb-12"
          />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {problemCards.map((card) => (
            <li key={card.serviceSlug}>
              <MotionCard className="h-full">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-synergy/30 hover:shadow-card sm:p-6">
                  <div
                    className="absolute left-0 top-0 h-1 w-full bg-gradient-brand opacity-80 transition group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="flex items-start gap-3 sm:gap-4">
                    {isServiceIconKey(card.serviceSlug) ? (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-synergy-muted to-accent-soft text-synergy sm:h-14 sm:w-14"
                        aria-hidden
                      >
                        <ServiceCategoryIcon name={card.serviceSlug} className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-synergy">{card.label}</span>
                      <h3 className="mt-2 text-base font-semibold text-ink sm:text-lg">{card.problem}</h3>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-body">{card.solution}</p>
                  <Link
                    href={`/services/${card.serviceSlug}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-synergy transition group-hover:gap-2"
                  >
                    Learn more <span aria-hidden>→</span>
                  </Link>
                </div>
              </MotionCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
