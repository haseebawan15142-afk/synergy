import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { DynatracePartnerGallery } from "@/components/partners/DynatracePartnerGallery";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { fetchSiteSettings } from "@/lib/cms/public";

export async function DynatracePartnerSection() {
  const settings = await fetchSiteSettings();

  return (
    <section className="border-b border-border/70 bg-surface section-y" aria-labelledby="dynatrace-partner-heading">
      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
          <Reveal>
            <SectionHeading
              id="dynatrace-partner-heading"
              eyebrow={dynatracePartner.badge}
              title={dynatracePartner.headline}
              description={dynatracePartner.subheadline}
              className="max-w-xl [&_p:first-child]:text-synergy [&_p:last-child]:text-ink-body"
            />

            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-surface-elevated p-4 shadow-soft sm:p-5">
              <div className="flex min-w-[160px] flex-1 items-center justify-center rounded-lg border border-border/60 bg-white px-4 py-3">
                <img
                  src={dynatracePartner.logo}
                  alt="Dynatrace"
                  className="h-9 w-auto object-contain"
                />
              </div>              <span className="text-sm text-ink-muted" aria-hidden>
                ×
              </span>
              <div className="flex min-w-[180px] flex-1 items-center justify-center rounded-lg border border-border/60 bg-white px-3 py-2.5">
                <BrandLogo
                  variant="header"
                  theme="light"
                  logoUrl={settings.logoUrl}
                  darkLogoUrl={settings.darkLogoUrl}
                  companyName={settings.legalName || settings.companyName}
                />
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-ink-body sm:text-base">{dynatracePartner.description}</p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {dynatracePartner.capabilities.map((capability) => (
                <li
                  key={capability.title}
                  className="rounded-lg border border-border/70 bg-surface-muted/50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-ink">{capability.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{capability.description}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/contact" variant="primary">
                Talk to an expert
              </Button>
              <Button href={`/resources/${dynatracePartner.resourceSlug}`} variant="secondary">
                Learn more
              </Button>
            </div>

            <Link
              href={dynatracePartner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex text-sm font-medium text-ink-muted transition hover:text-synergy"
            >
              Visit dynatrace.com →
            </Link>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.06}>
            <div className="relative overflow-hidden rounded-xl border border-border/80 bg-surface-elevated shadow-soft">
              <DynatracePartnerGallery slides={dynatracePartner.gallery} />
              <div className="border-t border-border/70 bg-surface-elevated p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-synergy">Dynatrace Innovate 2026</p>
                <p className="mt-2 text-lg font-semibold text-ink">Synergy × Dynatrace in Singapore</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">
                  Photos from our team&apos;s participation at Dynatrace Innovate Singapore 2026 with banking
                  customers and Dynatrace leadership — exploring AI-powered observability and autonomous operations.
                </p>
                <Link
                  href={dynatracePartner.linkedinPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex text-sm font-medium text-synergy transition hover:text-synergy-dark"
                >
                  View LinkedIn post →
                </Link>                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border/60 pt-5">
                  {dynatracePartner.highlights.map((item) => (
                    <div key={item.label}>
                      <dt className="font-display text-xl font-bold text-ink">{item.value}</dt>
                      <dd className="mt-1 text-[11px] leading-snug text-ink-muted">{item.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
