import { ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import type { SocialLink } from "@/lib/content/social-links";

type CareersCommunitySectionProps = {
  socialLinks?: SocialLink[];
};

export function CareersCommunitySection({ socialLinks = [] }: CareersCommunitySectionProps) {
  if (!socialLinks.length) return null;

  return (
    <section className="border-t border-border/60 section-y" aria-labelledby="careers-community-heading">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="careers-community-heading"
            eyebrow="Life at Synergy"
            title="Join our community"
            description="Follow Synergy Computers for updates on open roles, projects, and life at the company."
            className="max-w-2xl"
          />
        </Reveal>

        <Reveal variant="fadeUp" delay={0.06}>
          <div className="mt-8 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:border-synergy/40 hover:text-synergy"
              >
                Follow on {link.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
