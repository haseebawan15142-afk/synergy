import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { companyProfileMeta, profileStats } from "@/lib/content/company-profile";

const statAccents = [
  "from-synergy/20 to-synergy/5",
  "from-accent/25 to-accent/5",
  "from-synergy/15 to-transparent",
  "from-accent/20 to-transparent",
] as const;

export function StorySection() {
  return (
    <section className="page-container section-y relative">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <Reveal className="order-2 lg:order-1" variant="slideFromLeft">
          <SectionHeading
            eyebrow="Our story"
            title="Four decades of enterprise technology leadership"
            description={`Synergy Computers (Pvt.) Ltd has been a trusted technology partner in Pakistan since ${companyProfileMeta.foundedYear} — helping enterprises modernize, secure, and run critical IT.`}
          />
          <p className="mt-6 text-sm leading-relaxed text-ink-body sm:text-base">
            Backed by {companyProfileMeta.teamSizeLabel} professionals and global technology
            alliances, we deliver as a one-window partner for secure, scalable IT.
          </p>
          <Button href="/about" variant="secondary" className="mt-8 w-full sm:w-auto">
            About Synergy
          </Button>
        </Reveal>
        <div className="order-1 grid grid-cols-2 gap-3 sm:gap-4 lg:order-2 lg:gap-5">
          {profileStats.map((item, index) => (
            <MotionCard
              key={item.label}
              reveal
              className={`group rounded-2xl border border-border/80 bg-gradient-to-br ${statAccents[index % statAccents.length]} bg-surface-elevated p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-card sm:p-6`}
            >
              <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
                <AnimatedCounter value={item.value} />
              </p>
              <p className="mt-2 text-xs font-medium text-ink-muted sm:text-sm">{item.label}</p>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
}
