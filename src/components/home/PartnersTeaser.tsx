import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function PartnersTeaser() {
  return (
    <section className="page-container section-y-tight">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border/80 bg-gradient-to-br from-synergy-muted/80 via-surface-elevated to-accent-soft/50 p-6 shadow-soft sm:gap-8 sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:p-12">
          <SectionHeading
            eyebrow="Partners"
            title="Experts across your technology stack"
            description="From the data center to the cloud, we work with leading global principals to design and support protected, optimized architectures."
          />
          <Button href="/partners" variant="primary" className="w-full shrink-0 sm:w-auto">
            See all partners
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
