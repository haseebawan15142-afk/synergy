import Image from "next/image";
import { leadershipTeam } from "@/lib/content/leadership";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LeadershipSection() {
  return (
    <section id="leadership" className="scroll-mt-24 border-t border-border/60 section-y" aria-labelledby="leadership-heading">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="leadership-heading"
            eyebrow="Our People"
            title="Our Leadership"
            description="The team responsible for Synergy's strategy, delivery quality, and long-term client relationships."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {leadershipTeam.map((member, index) => (
            <Reveal key={member.name} variant="fadeUp" delay={index * 0.06}>
              <div className="flex h-full flex-col items-center rounded-xl border border-border/70 bg-surface-elevated p-6 text-center shadow-soft transition hover:border-synergy/40 hover:shadow-card">
                {member.photoSrc ? (
                  <Image
                    src={member.photoSrc}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-synergy-muted text-lg font-bold text-synergy-dark dark:text-synergy-glow">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="mt-4 text-base font-bold text-ink">{member.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-synergy">
                  {member.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-body">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
