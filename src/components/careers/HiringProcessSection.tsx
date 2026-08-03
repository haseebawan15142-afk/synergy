import { hiringSteps } from "@/lib/content/careers";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function HiringProcessSection() {
  return (
    <section className="section-y" aria-labelledby="hiring-process-heading">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="hiring-process-heading"
            eyebrow="Our Hiring Process"
            title="As simple as it could be"
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {hiringSteps.map((step, index) => (
            <Reveal key={step.title} variant="fadeUp" delay={index * 0.06}>
              <div className="relative h-full rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft">
                <span className="text-3xl font-bold text-synergy/30">{step.step}</span>
                <h3 className="mt-2 text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
