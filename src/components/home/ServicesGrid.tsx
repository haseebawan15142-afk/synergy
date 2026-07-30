import Link from "next/link";
import { services } from "@/lib/content/services";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";

export function ServicesGrid() {
  return (
    <section className="page-container section-y" aria-labelledby="services-heading">
      <Reveal className="flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          id="services-heading"
          eyebrow="Capabilities"
          title="Explore our services"
          description="End-to-end expertise from infrastructure and security to cloud and managed operations."
        />
        <Button href="/services" variant="secondary" className="w-full shrink-0 sm:w-auto">
          View all services
        </Button>
      </Reveal>
      <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {services.map((service, i) => (
          <li key={service.slug}>
            <MotionCard className="h-full">
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-surface-elevated p-5 shadow-soft transition hover:-translate-y-1 hover:border-synergy/35 hover:shadow-card sm:p-6"
              >
                <span className="font-mono text-xs font-medium text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink sm:text-lg group-hover:text-synergy">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-body">{service.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-synergy transition group-hover:gap-2">
                  Read more <span aria-hidden>→</span>
                </span>
              </Link>
            </MotionCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
