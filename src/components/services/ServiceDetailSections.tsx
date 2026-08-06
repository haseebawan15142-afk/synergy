import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  serviceProcess,
  type ServiceDetail,
} from "@/lib/content/service-details";

type ServiceDetailSectionsProps = {
  detail: ServiceDetail;
};

export function ServiceDetailSections({ detail }: ServiceDetailSectionsProps) {
  const pillars = [
    { title: "The Challenge", body: detail.challenge },
    { title: "Our Approach", body: detail.approach },
    { title: "The Benefits", body: detail.benefits },
  ];

  return (
    <>
      <section className="section-y bg-surface">
        <div className="page-container max-w-5xl">
          <h2 className="text-section-title font-display font-bold text-ink">
            {detail.headline}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-body sm:text-lg">
            {detail.lead}
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="border-t-2 border-synergy pt-5">
                <h3 className="text-lg font-bold text-ink">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-body sm:text-[0.95rem]">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface-muted/50 section-y">
        <div className="page-container">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">
            Capabilities
          </p>
          <h2 className="mt-3 max-w-2xl text-section-title font-display font-bold text-ink">
            Specialized solutions for your environment
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {detail.capabilities.map((item) => (
              <article
                key={item.title}
                className="h-full border-l-2 border-synergy/70 bg-surface-elevated px-5 py-6 shadow-soft"
              >
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="page-container">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">
            Outcomes
          </p>
          <h2 className="mt-3 max-w-2xl text-section-title font-display font-bold text-ink">
            What good delivery looks like
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {detail.outcomes.map((item) => (
              <div key={item.title} className="h-full rounded-2xl bg-surface-muted/70 p-6">
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-surface-elevated section-y">
        <div className="page-container">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">
            Our process
          </p>
          <h2 className="mt-3 max-w-2xl text-section-title font-display font-bold text-ink">
            A step-by-step path to reliable outcomes
          </h2>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceProcess.map((step) => (
              <li key={step.step} className="relative h-full">
                <p className="text-sm font-bold tracking-[0.16em] text-synergy">
                  {step.step}
                </p>
                <h3 className="mt-2 text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-y">
        <div className="page-container">
          <div className="overflow-hidden rounded-3xl bg-gradient-dark px-6 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy-light">
                Next step
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Ready to scope this for your environment?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                Tell us about your current estate and goals. We&apos;ll help shape a practical plan
                with clear ownership and delivery.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col xl:flex-row">
              <Button href="/contact" variant="primary" className="bg-synergy hover:bg-synergy-dark">
                Talk to an expert
              </Button>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/25 transition hover:bg-white/10"
              >
                ← All services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
