import { Handshake, GraduationCap, Heart, Award, type LucideIcon } from "lucide-react";
import { cultureCards } from "@/lib/content/careers";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const icons: Record<string, LucideIcon> = {
  handshake: Handshake,
  graduation: GraduationCap,
  heart: Heart,
  award: Award,
};

export function CultureSection() {
  return (
    <section className="border-t border-border/60 bg-surface-muted/60 section-y" aria-labelledby="culture-heading">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="culture-heading"
            eyebrow="Working at Synergy"
            title="A place to learn, grow, and do meaningful work"
            description="We aim to create an environment where our people can build real skills on real enterprise IT projects."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {cultureCards.map((card, index) => {
            const Icon = icons[card.icon];
            return (
              <Reveal key={card.title} variant="fadeUp" delay={index * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-synergy-muted text-synergy-dark dark:text-synergy-glow">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-body">{card.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
