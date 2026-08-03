import { jobOpenings, officeLocations } from "@/lib/content/careers";
import { Reveal } from "@/components/motion/Reveal";

const stats = [
  { value: "40+", label: "Years in enterprise IT" },
  { value: `${jobOpenings.length}`, label: "Open positions right now" },
  { value: `${officeLocations.length}`, label: "Offices across Pakistan" },
  { value: "24×7", label: "Support-driven culture" },
] as const;

export function CareersStatsSection() {
  return (
    <section className="border-y border-border/60 bg-surface-muted/60 py-10 sm:py-12" aria-label="Synergy in numbers">
      <div className="page-container grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} variant="fadeUp" delay={index * 0.05}>
            <div className="text-center">
              <p className="text-3xl font-bold text-synergy sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-ink-muted sm:text-sm">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
