"use client";

import { useCallback } from "react";
import { leadershipTeam } from "@/lib/content/leadership";
import { fetchLeadership } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
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

function normalizeLinkedInUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Lucide no longer ships brand icons — inline LinkedIn mark. */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function LeadershipSection() {
  const loader = useCallback(() => fetchLeadership(), []);
  const team = useCmsList(leadershipTeam, loader);

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
          {team.map((member, index) => {
            const linkedinHref = member.linkedin ? normalizeLinkedInUrl(member.linkedin) : null;
            return (
              <Reveal
                key={`${member.name}-${member.title}-${index}`}
                variant="fadeUp"
                delay={index * 0.06}
              >
                <div className="flex h-full flex-col items-center rounded-xl border border-border/70 bg-surface-elevated p-6 text-center shadow-soft transition hover:border-synergy/40 hover:shadow-card">
                  {member.photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoSrc}
                      alt={member.name}
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
                  {member.bio ? (
                    <p className="mt-3 text-sm leading-relaxed text-ink-body">{member.bio}</p>
                  ) : null}
                  {linkedinHref ? (
                    <a
                      href={linkedinHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-[#0A66C2] transition hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]/50"
                    >
                      <LinkedInIcon className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
