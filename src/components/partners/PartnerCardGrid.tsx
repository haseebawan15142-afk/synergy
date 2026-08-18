import Link from "next/link";
import { ArrowUpRight, Shield } from "lucide-react";
import {
  partnerDetailPath,
  partners as localPartners,
  type Partner,
} from "@/lib/content/partners";
import { ResilientImage, ResilientImg } from "@/components/media/ResilientImage";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PartnerCardGridProps = {
  partners: Partner[];
  title?: string;
  className?: string;
};

function localPartnerLogo(partner: Partner) {
  const slug = (partner.slug || partner.name).toLowerCase();
  return localPartners.find((p) => (p.slug || p.name).toLowerCase() === slug)?.logo;
}

export function PartnerCardGrid({
  partners,
  title = "Our Technology Partners",
  className,
}: PartnerCardGridProps) {
  if (!partners.length) return null;

  return (
    <section
      className={`relative overflow-hidden border-t border-synergy/20 section-y ${className ?? ""}`}
      aria-labelledby="partner-card-grid-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-synergy/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />

      <div className="page-container relative">
        <Reveal>
          <SectionHeading
            id="partner-card-grid-heading"
            eyebrow={title}
            title="Powering Innovation Together"
            description="Strategic alliances with global technology leaders — delivered with local expertise across Pakistan."
            align="center"
          />
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner, index) => {
            const href = partnerDetailPath(partner);
            const fallback = localPartnerLogo(partner);
            return (
              <Reveal key={href} delay={Math.min(index * 0.04, 0.24)} as="li">
                <Link href={href} className="digital-card group flex h-full flex-col p-5 sm:p-6">
                  <div className="relative z-[1] flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white px-2 py-2 shadow-soft">
                      {partner.logo ? (
                        partner.logo.toLowerCase().endsWith(".svg") ||
                        fallback?.toLowerCase().endsWith(".svg") ? (
                          <ResilientImg
                            src={partner.logo}
                            fallbackSrc={fallback}
                            alt={partner.name}
                            className="max-h-9 w-auto max-w-full object-contain"
                          />
                        ) : (
                          <ResilientImage
                            src={partner.logo}
                            fallbackSrc={fallback}
                            alt={partner.name}
                            width={120}
                            height={48}
                            className="max-h-9 w-auto max-w-full object-contain"
                          />
                        )
                      ) : (
                        <span className="text-xs font-semibold text-ink-muted">{partner.name}</span>
                      )}
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-synergy/40 bg-synergy/10 text-synergy transition group-hover:border-accent/50 group-hover:text-accent">
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>

                  <h3 className="relative z-[1] mt-5 text-base font-bold text-ink group-hover:text-synergy-light">
                    {partner.name}
                  </h3>
                  <p className="relative z-[1] mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-body">
                    {partner.shortDescription ||
                      `Explore how Synergy delivers ${partner.name} solutions for enterprise teams in Pakistan.`}
                  </p>
                  <span className="relative z-[1] mt-5 inline-flex items-center gap-1 text-sm font-semibold text-synergy">
                    Learn more
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.12} className="mt-8">
          <div className="digital-strip flex flex-col items-start gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-synergy/45 bg-synergy/15 text-synergy">
                <Shield className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-medium text-ink-body sm:text-base">
                Trusted technology principals — implementation, support, and delivery in Pakistan.
              </p>
            </div>
            <Link
              href="/partners"
              className="shrink-0 text-sm font-semibold text-synergy transition hover:text-accent"
            >
              Explore all partners →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
