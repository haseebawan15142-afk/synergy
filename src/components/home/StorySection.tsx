import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { MotionCard } from "@/components/motion/MotionCard";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

export function StorySection() {
  return (
    <section className="page-container section-y relative">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <Reveal className="order-2 lg:order-1" variant="slideFromLeft">
          <SectionHeading
            eyebrow="Our story"
            title="Four decades of enterprise technology leadership"
            description="Synergy Computers (Pvt.) Ltd has been Pakistan's premium IT solutions provider — hardware, application solutions, integration services, and comprehensive support for banking, healthcare, education, utilities, and enterprise clients nationwide."
          />
          <p className="mt-6 text-sm leading-relaxed text-ink-body sm:text-base">
            We combine strategic alliances with global principals, in-house software, and 24×7
            maintenance so you can treat us as a one-window partner for your IT requirements.
          </p>
          <Button href="/about" variant="secondary" className="mt-8 w-full sm:w-auto">
            About Synergy
          </Button>
        </Reveal>
        <div className="order-1 grid grid-cols-2 gap-3 sm:gap-4 lg:order-2 lg:gap-5">
          {[
            { stat: "40+", label: "Years of experience", accent: "from-synergy/20 to-synergy/5" },
            { stat: "300+", label: "Enterprise clients", accent: "from-accent/25 to-accent/5" },
            { stat: "200+", label: "Team members", accent: "from-synergy/15 to-transparent" },
            { stat: "4+", label: "Branch offices", accent: "from-accent/20 to-transparent" },
          ].map((item) => (
            <MotionCard
              key={item.label}
              reveal
              className={`group rounded-2xl border border-border/80 bg-gradient-to-br ${item.accent} bg-surface-elevated p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-card sm:p-6`}
            >
              <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
                <AnimatedCounter value={item.stat} />
              </p>
              <p className="mt-2 text-xs font-medium text-ink-muted sm:text-sm">{item.label}</p>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
}
