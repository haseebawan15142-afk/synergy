import { Award } from "lucide-react";
import { accomplishmentStats, milestones, certifications } from "@/lib/content/accomplishments";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function AccomplishmentsSection() {
  return (
    <section
      id="accomplishments"
      className="scroll-mt-24 border-t border-border/60 bg-surface-muted/60 section-y"
      aria-labelledby="accomplishments-heading"
    >
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="accomplishments-heading"
            eyebrow="Track Record"
            title="Our Accomplishments"
            description="Milestones and recognitions aligned to Synergy's Company Profile 2026."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:mt-12 lg:grid-cols-4 lg:gap-5">
          {accomplishmentStats.map((stat, index) => (
            <Reveal key={stat.label} variant="fadeUp" delay={index * 0.05}>
              <div className="rounded-xl border border-border/70 bg-surface-elevated p-5 text-center shadow-soft sm:p-6">
                <p className="text-2xl font-bold text-synergy sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-ink-muted sm:text-sm">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
          <Reveal variant="fadeUp">
            <ol className="relative space-y-8 border-l border-border/70 pl-6">
              {milestones.map((milestone) => (
                <li key={milestone.title} className="relative">
                  <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full bg-synergy" aria-hidden />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-synergy">{milestone.year}</p>
                  <h3 className="mt-1 text-base font-bold text-ink">{milestone.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-body">{milestone.description}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.08}>
            <div className="rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft sm:p-8">
              <h3 className="text-base font-bold text-ink">Certifications &amp; recognitions</h3>
              {certifications.length === 0 ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  Official certification and award names are not listed in the Company Profile 2026.
                  This section will be updated when verified credentials are provided.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {certifications.map((cert, index) => (
                    <li key={`${cert.name}-${index}`} className="flex items-start gap-3">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-synergy" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-ink">{cert.name}</p>
                        <p className="text-xs text-ink-muted">{cert.issuer}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
