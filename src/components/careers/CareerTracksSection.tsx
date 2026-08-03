import { GraduationCap, Briefcase, Rocket, type LucideIcon } from "lucide-react";
import { careerTracks } from "@/lib/content/careers";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const icons: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  briefcase: Briefcase,
  rocket: Rocket,
};

export function CareerTracksSection() {
  return (
    <section className="section-y" aria-labelledby="career-tracks-heading">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="career-tracks-heading"
            eyebrow="Career Tracks"
            title="Wherever you are in your career, there's a place for you"
            description="Techies, innovators, and problem-solvers — whether you're a recent graduate or an experienced professional, Synergy gives you real projects to grow on."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3 lg:mt-12">
          {careerTracks.map((track, index) => {
            const Icon = icons[track.icon];
            return (
              <Reveal key={track.title} variant="fadeUp" delay={index * 0.06}>
                <div className="flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft transition hover:border-synergy/40 hover:shadow-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-synergy-muted text-synergy-dark dark:text-synergy-glow">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink">{track.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-body">{track.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
