import Link from "next/link";
import {
  partnerDetailPath,
  partners as localPartners,
  type Partner,
} from "@/lib/content/partners";
import { ResilientImage, ResilientImg } from "@/components/media/ResilientImage";

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
  title = "Technology partners",
  className,
}: PartnerCardGridProps) {
  if (!partners.length) return null;

  return (
    <section
      className={`border-t border-border/60 bg-surface-elevated/90 section-y shadow-soft ${className ?? ""}`}
      aria-labelledby="partner-card-grid-heading"
    >
      <div className="page-container">
        <h2
          id="partner-card-grid-heading"
          className="text-center text-xs font-bold uppercase tracking-[0.25em] text-ink-muted sm:text-sm"
        >
          {title}
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => {
            const href = partnerDetailPath(partner);
            const fallback = localPartnerLogo(partner);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated p-5 shadow-soft transition duration-[250ms] ease-out hover:-translate-y-1 hover:border-synergy/40 hover:shadow-card"
                >
                  <div className="flex h-20 items-center justify-center rounded-lg bg-white px-4 py-3">
                    {partner.logo ? (
                      partner.logo.toLowerCase().endsWith(".svg") ||
                      fallback?.toLowerCase().endsWith(".svg") ? (
                        <ResilientImg
                          src={partner.logo}
                          fallbackSrc={fallback}
                          alt={partner.name}
                          className="max-h-12 w-auto max-w-full object-contain"
                        />
                      ) : (
                        <ResilientImage
                          src={partner.logo}
                          fallbackSrc={fallback}
                          alt={partner.name}
                          width={160}
                          height={64}
                          className="max-h-12 w-auto max-w-full object-contain"
                        />
                      )
                    ) : (
                      <span className="text-sm font-semibold text-ink-muted">{partner.name}</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink group-hover:text-synergy">
                    {partner.name}
                  </h3>
                  {partner.shortDescription ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-body">
                      {partner.shortDescription}
                    </p>
                  ) : (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-body">
                      Explore how Synergy delivers {partner.name} solutions for enterprise teams in
                      Pakistan.
                    </p>
                  )}
                  <span className="mt-auto pt-4 text-sm font-semibold text-synergy">
                    Learn more →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
