import Link from "next/link";
import { industries } from "@/lib/content/industries";
import { GsapParallax } from "@/components/effects/GsapParallax";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";

export function IndustriesGrid() {
  return (
    <section className="page-container section-y" aria-labelledby="industries-heading">
      <Reveal>
        <SectionHeading
          id="industries-heading"
          eyebrow="Sectors"
          title="Industry expertise"
          description="Deep experience across sectors that depend on reliable, secure technology."
        />
      </Reveal>
      <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind) => (
          <li key={ind.slug}>
            <MotionCard className="h-full">
              <Link
                href={`/industries/${ind.slug}`}
                className="group block rounded-2xl border border-border/80 bg-surface-elevated p-5 shadow-soft transition hover:border-accent/40 hover:shadow-card sm:p-6"
              >
                <h3 className="font-semibold text-ink group-hover:text-synergy">{ind.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">{ind.summary}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-synergy opacity-0 transition group-hover:opacity-100">
                  View sector →
                </span>
              </Link>
            </MotionCard>
          </li>
        ))}
      </ul>
      <Button href="/industries" variant="ghost" className="mt-8 w-full sm:w-auto">
        View all industries
      </Button>
    </section>
  );
}

export function CtaBand() {
  return (
    <Reveal as="section" className="page-container section-y-tight mb-12 sm:mb-16">
        <GsapParallax className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-dark" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-synergy/30 via-transparent to-accent/20"
          aria-hidden
        />
        <div className="relative px-5 py-12 text-center sm:px-10 sm:py-16 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy-light">Next step</p>
          <h2 className="text-section-title mt-3 font-display font-bold text-white">Meet with an expert</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Tell us about your environment and goals. We&apos;ll help you shape a practical plan — contact
            our team in Karachi or any branch.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Button href="/contact" size="lg" className="w-full sm:w-auto">
              Get in touch
            </Button>
            <a
              href="mailto:info@synergy.net.pk"
              className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              info@synergy.net.pk
            </a>
          </div>
        </div>
      </GsapParallax>
    </Reveal>
  );
}
