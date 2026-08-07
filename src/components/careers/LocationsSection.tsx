import Link from "next/link";
import { MapPin } from "lucide-react";
import { officeLocations } from "@/lib/content/careers";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function LocationsSection() {
  return (
    <section
      className="border-t border-border/60 bg-surface-muted/60 section-y"
      aria-labelledby="locations-heading"
    >
      <div className="page-container">
        <Reveal className="flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            id="locations-heading"
            eyebrow="Where We're Based"
            title="Opportunities across Pakistan"
            description="Our head office is in Karachi, with branches serving clients across the country."
            className="max-w-2xl"
          />
          <Link
            href="/contact#locations"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-synergy hover:underline"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            See all offices on map
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:mt-12 lg:grid-cols-4">
          {officeLocations.map((loc, index) => (
            <Reveal key={loc.city} variant="fadeUp" delay={index * 0.05}>
              <Link
                href="/contact#locations"
                className="flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-surface-elevated p-6 text-center shadow-soft transition hover:border-synergy/40 hover:shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-synergy-muted text-synergy-dark dark:text-synergy-glow">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-base font-bold text-ink">{loc.city}</p>
                <p className="text-xs font-medium text-ink-muted">{loc.note}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
