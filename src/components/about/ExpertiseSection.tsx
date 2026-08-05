import { coreCapabilities, expertisePillars } from "@/lib/content/company-profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function ExpertiseSection() {
  return (
    <section
      id="expertise"
      className="scroll-mt-24 border-t border-border/60 section-y"
      aria-labelledby="expertise-heading"
    >
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="expertise-heading"
            eyebrow="Our Expertise"
            title="Infrastructure, applications, and support"
            description="End-to-end capabilities described in the Synergy Computers Company Profile 2026."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
          {expertisePillars.map((pillar, index) => (
            <Reveal key={pillar.title} variant="fadeUp" delay={index * 0.06}>
              <article className="flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft">
                <h3 className="text-base font-bold text-ink">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-body">{pillar.description}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fadeUp" delay={0.1}>
          <div className="mt-10">
            <h3 className="text-base font-bold text-ink">Core capabilities</h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {coreCapabilities.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border/70 bg-surface-muted/50 p-5"
                >
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-body">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
